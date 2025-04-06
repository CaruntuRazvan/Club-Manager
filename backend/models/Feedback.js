const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Referință la colecția Event
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la colecția User (antrenorul care a creat evenimentul)
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referință la colecția User (jucătorul pentru care se dă feedback-ul)
    required: true,
  },
  satisfactionLevel: {
    type: String,
    enum: ['good', 'neutral', 'bad'], // Doar aceste valori sunt permise
    required: true,
    default: 'neutral', // Valoare implicită
  },
  comment: {
    type: String,
    trim: true, // Elimină spațiile inutile
    default: '', // Comentariul este opțional
  },
}, { timestamps: true }); // Adaugă createdAt și updatedAt automat

//feedback unic
feedbackSchema.index({ eventId: 1, receiverId: 1 }, { unique: true });


module.exports = mongoose.model('Feedback', feedbackSchema);