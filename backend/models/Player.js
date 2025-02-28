const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  history: [
    {
      club: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: { type: Number, required: true },
    }
  ],
  image: { type: String }

}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
