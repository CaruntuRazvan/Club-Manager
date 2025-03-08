const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Extrage token-ul din header-ul Authorization (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Autentificare necesară. Token nu a fost furnizat.');
    }

    // Verifică și decodifică token-ul
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Caută utilizatorul în baza de date
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('Utilizator inexistent.');
    }

    // Setează req.user cu datele relevante
    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      playerId: user.playerId ? user.playerId.toString() : null,
      managerId: user.managerId ? user.managerId.toString() : null,
      staffId: user.staffId ? user.staffId.toString() : null
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Autentificare eșuată: ' + error.message });
  }
};

module.exports = auth;