const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Middleware pentru a verifica dacă utilizatorul este manager sau staff
const isManagerOrStaff = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Acces permis doar managerilor și staff-ului.' });
  }
  next();
};

// POST /api/events - Creează un eveniment nou (pentru manager sau staff)
router.post('/', auth, isManagerOrStaff, async (req, res) => {
  try {
    const { title, description, startDate, finishDate, players, staff, eventType } = req.body;

    // Creează evenimentul
    const event = new Event({
      title,
      description,
      startDate,
      finishDate,
      players,
      staff,
      createdBy: req.user._id,
      status: 'Scheduled',
      eventType: eventType || 'Training', // Adăugăm eventType cu o valoare implicită
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Eroare la crearea evenimentului:', error);
    res.status(500).json({ message: error.message || 'Eroare la crearea evenimentului.' });
  }
});

// GET /api/events - Obține evenimentele (pentru jucători)
router.get('/', auth, async (req, res) => {
  try {
    let events;

    if (req.user.role === 'player') {
      events = await Event.find({ players: req.user._id }).populate('players staff createdBy');
    } else {
      return res.status(403).json({ message: 'Acces interzis.' });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Eroare la obținerea evenimentelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea evenimentelor.' });
  }
});

module.exports = router;