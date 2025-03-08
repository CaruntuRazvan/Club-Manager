const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  finishDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Finished'], default: 'Scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referință către User care a creat evenimentul
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }], // Lista de jucători (User cu role 'player')
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }], // Lista de staff (User cu role 'staff')
}, { timestamps: true });

// Middleware pentru a valida relațiile (ex. să se asigure că players și staff au rolurile corecte)
eventSchema.pre('save', async function (next) {
  try {
    const event = this;

    // Verifică dacă finishDate este după startDate
    if (new Date(event.finishDate) <= new Date(event.startDate)) {
      throw new Error('finishDate trebuie să fie după startDate.');
    }

    // Opțional: Verifică rolurile pentru players și staff (dacă dorești validare strictă)
    if (event.players && event.players.length > 0) {
      const users = await mongoose.model('User').find({ _id: { $in: event.players } });
      const invalidPlayers = users.filter(user => user.role !== 'player' || !user.playerId);
      if (invalidPlayers.length > 0) {
        throw new Error('Unii ID-uri din players nu sunt jucători valizi.');
      }
    }

    if (event.staff && event.staff.length > 0) {
      const users = await mongoose.model('User').find({ _id: { $in: event.staff } });
      const invalidStaff = users.filter(user => user.role !== 'staff' || !user.staffId);
      if (invalidStaff.length > 0) {
        throw new Error('Unii ID-uri din staff nu sunt staff valizi.');
      }
    }

    // Verifică dacă createdBy este un manager (opțional)
    const creator = await mongoose.model('User').findById(event.createdBy);
    if (creator && creator.role !== 'manager') {
      throw new Error('Evenimentul poate fi creat doar de un manager.');
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Event', eventSchema);