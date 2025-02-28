const express = require("express");
const User = require("../models/User");
const Player = require('../models/Player');
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');


const { loginUser} = require("../controllers/userController");

router.post("/login", loginUser);
// Setarea opțiunilor pentru multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/players'); // Unde vor fi salvate fișierele
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Numele fișierului
  }
});

const upload = multer({ storage: storage })
// Obține toți utilizatorii
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Adaugă un utilizator
router.post('/add', upload.single('image'), async (req, res) => {
  const { name, email, password, role, playerDetails, managerDetails, staffDetails } = req.body;

  // Verificare câmpuri obligatorii de bază
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Toate câmpurile de bază sunt obligatorii!' });
  }

  try {
    // Hashing parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inițializăm utilizatorul fără detalii asociate
    let newUser = new User({ name, email, password: hashedPassword, role });
    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Gestionăm rolurile specifice
    if (role === 'player') {
      if (!playerDetails) {
        return res.status(400).json({ message: 'Detaliile jucătorului sunt necesare pentru rolul de player!' });
      }

      const parsedPlayerDetails = typeof playerDetails === 'string' ? JSON.parse(playerDetails) : playerDetails;
      const { firstName, lastName, dateOfBirth, nationality, height, weight, history } = parsedPlayerDetails;

      // Verificare câmpuri obligatorii pentru Player
      if (!firstName || !lastName || !dateOfBirth || !nationality || !height || !weight) {
        return res.status(400).json({ message: 'Toate câmpurile pentru Player sunt obligatorii!' });
      }

      const newPlayer = new Player({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        height: Number(height),
        weight: Number(weight),
        history,
        image: imagePath,
      });

      const savedPlayer = await newPlayer.save();
      newUser.playerId = savedPlayer._id;
    } else if (role === 'manager') {
      if (!managerDetails) {
        return res.status(400).json({ message: 'Detaliile managerului sunt necesare pentru rolul de manager!' });
      }

      const parsedManagerDetails = typeof managerDetails === 'string' ? JSON.parse(managerDetails) : managerDetails;
      const { firstName, lastName, dateOfBirth, nationality, history } = parsedManagerDetails;

      // Verificare câmpuri obligatorii pentru Manager
      if (!firstName || !lastName || !dateOfBirth || !nationality) {
        return res.status(400).json({ message: 'Toate câmpurile pentru Manager sunt obligatorii!' });
      }

      const newManager = new Manager({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        history,
        image: imagePath,
      });

      const savedManager = await newManager.save();
      newUser.managerId = savedManager._id; // Presupun că User schema are un câmp managerId
    } else if (role === 'staff') {
      if (!staffDetails) {
        return res.status(400).json({ message: 'Detaliile staff-ului sunt necesare pentru rolul de staff!' });
      }

      const parsedStaffDetails = typeof staffDetails === 'string' ? JSON.parse(staffDetails) : staffDetails;
      const { firstName, lastName, dateOfBirth, nationality, role: staffRole, history, certifications } = parsedStaffDetails;

      // Verificare câmpuri obligatorii pentru Staff
      if (!firstName || !lastName || !dateOfBirth || !nationality || !staffRole) {
        return res.status(400).json({ message: 'Toate câmpurile pentru Staff sunt obligatorii!' });
      }

      const newStaff = new Staff({
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        role: staffRole,
        history,
        certifications,
        image: imagePath,
      });

      const savedStaff = await newStaff.save();
      newUser.staffId = savedStaff._id; // Presupun că User schema are un câmp staffId
    }

    // Salvează utilizatorul cu ID-urile asociate (dacă există)
    newUser = await newUser.save();

    res.status(201).json({ message: 'Utilizator adăugat cu succes!', user: newUser });
  } catch (error) {
    console.error('Eroare la adăugarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la adăugarea utilizatorului.' });
  }
});

module.exports = router;

router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Căutăm toți utilizatorii din baza de date
    res.status(200).json({ users }); // Returnăm utilizatorii sub forma unui obiect { users: [...] }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Eroare la obținerea utilizatorilor.' });
  }
});

router.get('/:role/:id', async (req, res) => {
  try {
    const { role, id } = req.params;
    const validRoles = ['admin', 'player', 'manager', 'staff'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    let user;
    if (role === 'admin') {
      // Dacă rolul este admin, căutăm direct în colecția User
      user = await User.findById(id);
    } else {
      // Dacă nu este admin, populăm cu referințele corespunzătoare
      user = await User.findOne({ _id: id }).populate(`${role}Id`);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/delete', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email-ul este necesar!' });
  }

  try {
    // Căutăm utilizatorul pe baza email-ului și îl ștergem
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit!' });
    }

    // Răspuns de succes
    res.status(200).json({ message: 'Utilizator șters cu succes!' });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea utilizatorului.' });
  }
});

module.exports = router;
