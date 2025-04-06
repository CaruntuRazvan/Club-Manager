const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Lista utilizatorilor care au votat pentru această opțiune
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: false }, // Data de expirare a sondajului (opțional)
  deleteAt: { type: Date },
}, { timestamps: true });

// Validare: Asigură-te că există cel puțin 2 opțiuni
//se sterg poll-urile automat dupa 12 luni
pollSchema.pre('save', function (next) {
  if (this.options.length < 2) {
    return next(new Error('Un sondaj trebuie să aibă cel puțin 2 opțiuni.'));
  }
  // Dacă există expiresAt, setează deleteAt la expiresAt + 1 lună
  if (this.expiresAt) {
    const expiresAtDate = new Date(this.expiresAt);
    this.deleteAt = new Date(expiresAtDate.setMonth(expiresAtDate.getMonth() + 12));
  }
  next();
});

// Documentul va fi șters automat după ce deleteAt trece 
pollSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Poll', pollSchema);