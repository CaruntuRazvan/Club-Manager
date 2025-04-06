const cron = require('node-cron');
const Event = require('../models/Event');
const Notification = require('../models/Notification');


// Rulează la fiecare oră (la minutul 0)
const updateEventStatus = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Verific statusul evenimentelor...');
      const now = new Date();

      // Găsește toate evenimentele care sunt Scheduled și au finishDate în trecut
      const eventsToUpdate = await Event.find({
        status: 'Scheduled',
        finishDate: { $lt: now },
      });

      if (eventsToUpdate.length === 0) {
        console.log('Nu există evenimente de actualizat.');
        return;
      }

      // Actualizează statusul la Finished
      await Promise.all(
        eventsToUpdate.map(async (event) => {
          event.status = 'Finished';
          await event.save();
        })
      );

      console.log(`${eventsToUpdate.length} evenimente au fost actualizate la statusul Finished.`);
    } catch (error) {
      console.error('Eroare la actualizarea statusului evenimentelor:', error);
    }
  });
};

const cleanOldNotifications = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
      console.log('Notificările mai vechi de 30 de zile au fost șterse.');
    } catch (error) {
      console.error('Eroare la ștergerea notificărilor vechi:', error);
    }
  });
};
module.exports = { updateEventStatus, cleanOldNotifications };