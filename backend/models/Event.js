const mongoose = require('mongoose');
const Notification = require('./Notification');

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
    // Verifică dacă createdBy este un manager sau staff
    const creator = await mongoose.model('User').findById(event.createdBy);
    if (creator && !['manager', 'staff'].includes(creator.role)) {
      throw new Error('Evenimentul poate fi creat doar de un manager sau membru al staff-ului.');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Dacă folosești findOneAndDelete în loc de deleteOne, adaugă și acest middleware
eventSchema.pre('findOneAndDelete', async function (next) {
  try {
    const event = await this.model.findOne(this.getQuery());
    if (event) {
      const Feedback = mongoose.model('Feedback');
      // Șterge toate feedback-urile asociate acestui eveniment
      await Feedback.deleteMany({ eventId: event._id });
      console.log(`Feedback-urile pentru evenimentul ${event._id} au fost șterse.`);
    }
    next();
  } catch (error) {
    console.error('Eroare la ștergerea feedback-urilor:', error);
    next(error);
  }
});

// Middleware post('save') pentru notificări
eventSchema.post('save', async function (doc, next) {
  try {
    const event = doc;
    const participants = [...new Set([...event.players, ...event.staff])];
    const startDate = new Date(event.startDate).toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const notifications = participants.map(userId => ({
      userId,
      type: 'event',
      title: 'Eveniment nou',
      description: `Ai fost adăugat la un nou eveniment: ${event.title} pe ${startDate}.`,
      actionLink: `/event/${event._id}`,
      isRead: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(`Notificări generate pentru evenimentul ${event._id} către ${participants.length} utilizatori.`);

    next();
  } catch (error) {
    console.error('Eroare la generarea notificărilor:', error);
    next(error);
  }
});
// Middleware nou pentru ștergerea notificărilor asociate
eventSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    const event = doc;
    if (event) {
      // Șterge toate notificările asociate evenimentului
      await Notification.deleteMany({ actionLink: `/event/${event._id}` });
      console.log(`Notificările pentru evenimentul ${event._id} au fost șterse.`);
    }
    next();
  } catch (error) {
    console.error('Eroare la ștergerea notificărilor:', error);
    next(error);
  }
});
module.exports = mongoose.model('Event', eventSchema);