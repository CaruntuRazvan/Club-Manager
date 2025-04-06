const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const authMiddleware = require('../middleware/auth');

const isManagerOrStaff = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Acces permis doar managerilor și staff-ului.' });
  }
  next();
};

// POST /api/polls - Creează un sondaj nou (doar manageri și staff)
router.post('/', authMiddleware, isManagerOrStaff, async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    const createdBy = req.user._id;

    // Validăm că opțiunile sunt un array și conțin doar text
    if (!Array.isArray(options) || options.some(opt => typeof opt !== 'string')) {
      return res.status(400).json({ error: 'Opțiunile trebuie să fie un array de string-uri.' });
    }

    // Creăm opțiunile cu voturi goale
    const pollOptions = options.map(text => ({ text, votes: [] }));

    const poll = new Poll({
      question,
      options: pollOptions,
      createdBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await poll.save();
    res.status(201).json({ message: 'Sondaj creat cu succes', poll });
  } catch (error) {
    console.error('Eroare la crearea sondajului:', error);
    res.status(500).json({ error: 'Eroare la crearea sondajului', details: error.message });
  }
});

// POST /api/polls/:id/vote - Votează într-un sondaj (jucători și staff, dar nu admini)
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Adminii nu pot vota
    if (userRole === 'admin') {
      return res.status(403).json({ error: 'Adminii nu pot vota în sondaje.' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Sondajul nu există.' });
    }

    // Verificăm dacă sondajul a expirat
    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return res.status(403).json({ error: 'Sondajul a expirat.' });
    }

    // Verificăm dacă utilizatorul a votat deja
    const hasVoted = poll.options.some(option => option.votes.includes(userId));
    if (hasVoted) {
      return res.status(403).json({ error: 'Ai votat deja în acest sondaj.' });
    }

    // Validăm opțiunea aleasă
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Opțiune invalidă.' });
    }

    // Adăugăm votul utilizatorului
    poll.options[optionIndex].votes.push(userId);
    await poll.save();

    res.status(200).json({ message: 'Vot înregistrat cu succes.' });
  } catch (error) {
    console.error('Eroare la votare:', error);
    res.status(500).json({ error: 'Eroare la votare', details: error.message });
  }
});

// GET /api/polls - Preluarea tuturor sondajelor
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let polls;
    if (userRole === 'manager' || userRole === 'staff') {
      // Managerii și staff-ul pot vedea toate sondajele pe care le-au creat
      polls = await Poll.find({ createdBy: userId })
        .populate('createdBy', 'name')
        .lean();
    } else if (userRole === 'player') {
      // Jucătorii pot vedea toate sondajele active (neexpirate)
      polls = await Poll.find({
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } },
        ],
      })
        .populate('createdBy', 'name')
        .lean();
    } else {
      return res.status(403).json({ error: 'Rol necunoscut.' });
    }

    // Adăugăm informația despre dacă utilizatorul a votat
    polls = polls.map(poll => {
      const hasVoted = poll.options.some(option => option.votes.includes(userId));
      return { ...poll, hasVoted };
    });

    res.json(polls);
  } catch (error) {
    console.error('Eroare la preluarea sondajelor:', error);
    res.status(500).json({ error: 'Eroare la preluarea sondajelor', details: error.message });
  }
});

// GET /api/polls/:id - Preluarea unui sondaj specific (pentru rezultate)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name')
      .lean();

    if (!poll) {
      return res.status(404).json({ error: 'Sondajul nu există.' });
    }

    // Verificăm accesul
    if (userRole === 'manager' || userRole === 'staff') {
      // Managerii și staff-ul pot vedea rezultatele doar dacă sunt creatorii
      if (!poll.createdBy._id.equals(userId)) {
        return res.status(403).json({ error: 'Doar creatorul sondajului poate vedea rezultatele.' });
      }
    } else if (userRole === 'player') {
      // Jucătorii pot vedea sondajul, dar nu rezultatele (doar dacă au votat)
      const hasVoted = poll.options.some(option => option.votes.includes(userId));
      if (!hasVoted) {
        return res.status(403).json({ error: 'Trebuie să votezi pentru a vedea rezultatele.' });
      }
    } else {
      return res.status(403).json({ error: 'Rol necunoscut.' });
    }

    // Calculăm rezultatele pentru grafic
    const results = poll.options.map(option => ({
      text: option.text,
      voteCount: option.votes.length,
    }));

    res.json({ poll, results });
  } catch (error) {
    console.error('Eroare la preluarea sondajului:', error);
    res.status(500).json({ error: 'Eroare la preluarea sondajului', details: error.message });
  }
});
// DELETE /api/polls/:id - Șterge un sondaj (doar creatorul)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const pollId = req.params.id;

    // Găsim sondajul
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Sondajul nu există.' });
    }

    // Verificăm dacă utilizatorul este creatorul sondajului
    if (!poll.createdBy.equals(userId)) {
      return res.status(403).json({ error: 'Doar creatorul sondajului poate șterge acest sondaj.' });
    }

    // Ștergem sondajul
    await Poll.findByIdAndDelete(pollId);

    res.status(200).json({ message: 'Sondaj șters cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea sondajului:', error);
    res.status(500).json({ error: 'Eroare la ștergerea sondajului', details: error.message });
  }
});
module.exports = router;