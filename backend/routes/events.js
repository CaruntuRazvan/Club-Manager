const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Middleware pentru a verifica dacă utilizatorul este manager
const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Acces permis doar managerilor.' });
  }
  next();
};

// POST /api/events - Creează un eveniment nou (doar pentru manager)
router.post('/', auth, isManager, async (req, res) => {
  try {
    const { title, description, startDate, finishDate, players, staff } = req.body;

    // Creează evenimentul
    const event = new Event({
      title,
      description,
      startDate,
      finishDate,
      players,
      staff,
      createdBy: req.user._id,
      status: 'Scheduled'
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Eroare la crearea evenimentului:', error);
    res.status(500).json({ message: error.message || 'Eroare la crearea evenimentului.' });
  }
});


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