// Function to book an ambulance
function bookAmbulance() {
  const name = document.getElementById('name').value;
  const location = document.getElementById('location').value;
  const phone = document.getElementById('phone').value; // Get the phone number

  // Send a POST request to the server to book the ambulance
  fetch('/api/book-ambulance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, location, phone }), // Include the phone number
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server (e.g., show a confirmation message)
      console.log(data.message);

      // Clear the form fields after successful booking
      document.getElementById('name').value = '';
      document.getElementById('location').value = '';
      document.getElementById('phone').value = '';
    })
    .catch((error) => {
      console.error('Error booking ambulance:', error);
    });
}

// Event listener for booking button click
document.getElementById('book-button').addEventListener('click', bookAmbulance);

// Function to update the UI when a new ambulance booking is received
function updateUI(data) {
  // Update the UI to display the booking information (e.g., append it to a list)
  const bookingInfo = `Name: ${data.name}, Location: ${data.location}, Phone: ${data.phone}`;
  const bookingList = document.getElementById('booking-list');
  const listItem = document.createElement('li');
  listItem.textContent = bookingInfo;
  bookingList.appendChild(listItem);
}

// Connect to the server using Socket.io
const socket = io();

// Listen for new ambulance bookings from the server
socket.on('ambulanceBooking', (data) => {
  updateUI(data);
});
