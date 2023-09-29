const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
});

module.exports = mongoose.model('Ambulance', ambulanceSchema);
