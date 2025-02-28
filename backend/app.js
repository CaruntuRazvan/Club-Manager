const express = require("express");
const morgan = require("morgan"); // Pentru logging (opțional)
const usersRoutes = require("./routes/users"); // Ruta pentru utilizatori
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors()); 
//app.use('/uploads', express.static('uploads'));
// Servirea fișierelor statice din directorul uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json()); // Parsare JSON
app.use(morgan("dev")); // Logging (opțional)

// Rute
app.use("/api/users", usersRoutes); // Rutele utilizatorilor


module.exports = app; // Exportăm aplicația
