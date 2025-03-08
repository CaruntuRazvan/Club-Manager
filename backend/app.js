const express = require("express");
const morgan = require("morgan"); // Pentru logging (opțional)
const usersRoutes = require("./routes/users"); // Ruta pentru utilizatori
const eventsRoutes = require('./routes/events'); // Ruta pentru evenimente
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors()); 

// Servește fișierele statice din folderul uploads
app.use('/uploads', express.static('uploads'));
// Middleware
app.use(express.json()); // Parsare JSON
app.use(morgan("dev")); // Logging (opțional)

// Rute
app.use('/api/events', eventsRoutes);
app.use("/api/users", usersRoutes); // Rutele utilizatorilor

module.exports = app; // Exportăm aplicația
