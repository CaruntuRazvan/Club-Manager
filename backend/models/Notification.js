const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utilizatorul care primește notificarea
  type: { type: String, enum: ['event', 'feedback', 'poll'], required: true }, // Tipul notificării (momentan doar 'event')
  title: { type: String, required: true }, // Titlul notificării (ex. "Eveniment nou")
  description: { type: String, required: true }, // Descrierea notificării (ex. "Ai fost adăugat la un antrenament...")
  actionLink: { type: String, required: false }, // Link către resursa asociată (ex. "/event/123")
  isRead: { type: Boolean, default: false }, // Stare (citită/necitită)
  createdAt: { type: Date, default: Date.now }, // Data și ora generării
});

module.exports = mongoose.model('Notification', notificationSchema);