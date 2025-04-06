const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
const { generateFeedbackSummary } = require("../middleware/openaiService");
const User = require('../models/User'); // Adăugăm modelul User
const natural = require('natural');

// Inițializează analizorul de sentiment
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer; // Stemmer pentru engleză
const analyzer = new Analyzer('English', stemmer, 'afinn'); // Folosește lexiconul AFINN pentru engleză

// Inițializează tokenizer-ul
const tokenizer = new natural.WordTokenizer();

// Stop words în engleză (folosim lista predefinită din natural)
const stopWords = new Set(natural.stopwords);

// Ruta pentru adăugarea unui feedback (deja existentă)
router.post('/', authMiddleware, async (req, res) => {
  const { eventId, receiverId, satisfactionLevel, comment } = req.body;
  const creatorId = req.user._id;
  console.log(creatorId)
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evenimentul nu există' });
    }
    console.log(event.createdBy)
    if (!event.createdBy.equals(creatorId)) {
      return res.status(403).json({ error: 'Doar creatorul evenimentului poate adăuga feedback' });
    }

    if (!event.players.includes(receiverId)) {
      return res.status(400).json({ error: 'Jucătorul nu este implicat în acest eveniment' });
    }

    const existingFeedback = await Feedback.findOne({ eventId, receiverId });
    if (existingFeedback) {
      return res.status(400).json({ error: 'Ai lăsat deja feedback pentru acest jucător în acest eveniment' });
    }

    const feedback = new Feedback({
      eventId,
      creatorId,
      receiverId,
      satisfactionLevel,
      comment,
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback adăugat cu succes', feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ai lăsat deja feedback pentru acest jucător în acest eveniment' });
    }
    res.status(500).json({ error: 'Eroare la adăugarea feedback-ului', details: error.message });
  }
});


// Ruta pentru preluarea feedback-urilor pentru un eveniment
router.get('/event/:eventId', authMiddleware, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role; // Preluăm rolul utilizatorului din token

  console.log('Event ID:', eventId);
  console.log('User ID:', userId);
  console.log('User Role:', userRole);

  try {
    // 1. Verificăm dacă evenimentul există
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evenimentul nu există' });
    }

    let feedbacks;

    // 2. Gestionăm accesul în funcție de rolul utilizatorului
    if (userRole === 'manager') {
      // Managerii pot vedea feedback-urile doar dacă sunt creatorii evenimentului
      if (!event.createdBy.equals(userId)) {
        return res.status(403).json({ error: 'Doar creatorul evenimentului poate vedea feedback-urile' });
      }
      feedbacks = await Feedback.find({ eventId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else if (userRole === 'staff') {
      // Staff-ul poate vedea feedback-urile în două situații:
      // a) Este creatorul evenimentului
      // b) Este asociat cu evenimentul (în lista event.staff)
      const isCreator = event.createdBy.equals(userId);
      const isAssociatedStaff = event.staff.some(staffId => staffId.equals(userId));

      if (!isCreator && !isAssociatedStaff) {
        return res.status(403).json({ error: 'Nu ai acces la feedback-urile acestui eveniment' });
      }

      // Staff-ul (fie creator, fie asociat) poate vedea toate feedback-urile
      feedbacks = await Feedback.find({ eventId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else if (userRole === 'player') {
      // Jucătorii pot vedea doar feedback-ul care îi vizează
      feedbacks = await Feedback.find({ eventId, receiverId: userId })
        .populate('receiverId', 'name email firstName lastName')
        .lean();
    } else {
      return res.status(403).json({ error: 'Rol necunoscut' });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error('Eroare la preluarea feedback-urilor:', error);
    res.status(500).json({ error: 'Eroare la preluarea feedback-urilor', details: error.message });
  }
});

// Rută pentru a obține media și rezumatul feedback-urilor oferite de antrenor
router.get("/summary-by-creator/:creatorId", authMiddleware, async (req, res) => {
  try {
    const { creatorId } = req.params;

    if (req.user._id.toString() !== creatorId) {
      return res.status(403).json({ message: "Access denied. You can only view your own feedback reports." });
    }

    const feedbacks = await Feedback.find({ creatorId }).populate("receiverId", "name");

    const feedbackByPlayer = feedbacks.reduce((acc, feedback) => {
      const playerId = feedback.receiverId._id.toString();
      if (!acc[playerId]) {
        acc[playerId] = { playerName: feedback.receiverId.name, feedbacks: [] };
      }
      acc[playerId].feedbacks.push(feedback);
      return acc;
    }, {});

    const summary = [];

    for (const playerId in feedbackByPlayer) {
      const { playerName, feedbacks } = feedbackByPlayer[playerId];

      const comments = feedbacks.map((f) => f.comment).filter((c) => c);

      let summaryPhrase = "No specific observations.";

      if (comments.length > 0) {
        summaryPhrase = await generateFeedbackSummary(comments);
      }

      summary.push({
        playerId,
        playerName,
        summary: summaryPhrase,
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error generating feedback report:", error);
    res.status(500).json({ message: "Error generating report." });
  }
});
module.exports = router;