const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Configure Twilio with your credentials
const twilioAccountSid = 'AC95ed507ce6c3230d056a46d2d2f164c5';
const twilioAuthToken = '9649db5f4f8316ed296465b95dc928cb';
const twilioPhoneNumber = 'whatsapp:+14155238886';

const client = new twilio(twilioAccountSid, twilioAuthToken);

// Connect to the SQLite database "bookings" (or create a new one if it doesn't exist)
const db = new sqlite3.Database('bookings.sqlite3', (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create the "Bookings" table if it doesn't exist
    db.run("CREATE TABLE IF NOT EXISTS Bookings (id INTEGER PRIMARY KEY, name TEXT, location TEXT, phone TEXT)");
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Create a route to book an ambulance
app.post('/api/book-ambulance', (req, res) => {
  const { name, location, phone } = req.body; // Get the phone number

  // Save booking details to the "bookings" database
  db.run('INSERT INTO Bookings (name, location, phone) VALUES (?, ?, ?)', [name, location, phone], function (err) {
    if (err) {
      console.error('Error booking ambulance:', err);
      res.status(500).json({ error: 'Error booking ambulance.' });
    } else {
      // Send an SMS notification to the person who booked the ambulance
      const message = `Hello ${name}, your ambulance booking at ${location} has been confirmed. We will contact you at ${phone}.`;

      client.messages
      .create({
          body: 'YOUR AMBULANCE IS ON THE WAY THANKS FOR CHOOSING QKNIGHTS TECHNOLOGY',
          from: 'whatsapp:+14155238886',
          to: 'whatsapp:+91'+phone
      })
      .then(() => {
        console.log('SMS notification sent');
      })
      .catch((smsError) => {
        console.error('Error sending SMS notification:', smsError);
      });

      // Emit a Socket.io event to notify clients about the new booking
      io.emit('ambulanceBooking', { name, location, phone });

      res.status(201).json({ message: 'Ambulance booked successfully.' });
    }
  });
});

// Handle client connections with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
