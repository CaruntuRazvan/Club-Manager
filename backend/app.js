const express = require("express");
const morgan = require("morgan"); // logging
const usersRoutes = require("./routes/users"); // Ruta utilizatori
const eventsRoutes = require('./routes/events'); // Ruta evenimente
const feedbacksRoutes = require('./routes/feedbacks'); // Ruta feedback-uri
const pollsRoutes = require('./routes/polls'); // Ruta sondaje
const notificationsRoutes = require('./routes/notifications'); // Ruta notificări
const cors = require('cors');
const path = require('path');
const app = express();
const { updateEventStatus, cleanOldNotifications } = require('./middleware/cronJobs');
app.use(cors()); 

// Servește fișierele statice din folderul uploads
app.use('/uploads', express.static('uploads'));
// Middleware
app.use(express.json()); // Parsare JSON
app.use(morgan("dev")); // Logging (opțional)

// Rute
app.use('/api/events', eventsRoutes);
app.use("/api/users", usersRoutes); // Rutele utilizatorilor
app.use('/api/feedbacks', feedbacksRoutes); // Rutele evenimentelor
app.use('/api/polls', pollsRoutes); // Rutele sondajelor
app.use('/api/notifications', notificationsRoutes);
updateEventStatus(); // actualizarea statusului evenimentelor
cleanOldNotifications(); // ștergerea notificărilor vechi
module.exports = app; // Exportăm aplicația
