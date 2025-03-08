const express = require("express");
const User = require("../models/User");
const Player = require('../models/Player');
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');


const { loginUser} = require("../controllers/userController");

router.post("/login", loginUser);
// Setarea opțiunilor pentru multer

// Funcție pentru a determina folderul în funcție de rol
const getDestination = (role) => {
  switch (role) {
    case 'player':
      return 'uploads/players';
    case 'manager':
      return 'uploads/manager';
    case 'staff':
      return 'uploads/staff';
    default:
      return 'uploads/other'; // Fallback pentru alte roluri
  }
};

// Configurare storage pentru multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const role = req.body.role; // Rolul trimis din formular
    const destination = path.join(__dirname, '..', getDestination(role)); // Cale absolută către folder

    // Verificăm dacă folderul există, dacă nu, îl creăm
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    cb(null, destination); // Setăm folderul de destinație
  },
  filename: (req, file, cb) => {
    const email = req.body.email; // Email-ul trimis din formular
    if (!email) {
      return cb(new Error('Email-ul este obligatoriu pentru numele fișierului!'), null);
    }

    // Înlocuim @ cu _ și păstrăm extensia originală
    const emailPrefix = email.replace('@', '_');
    const fileExtension = file.originalname.split('.').pop(); // Ex. jpg, png
    const filename = `${emailPrefix}.${fileExtension}`; // Ex. johndoe_prosport.jpg
    cb(null, filename); // Setăm numele fișierului
  },
});

const upload = multer({ storage: storage })
// Obține toți utilizatorii
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .populate('playerId')
      .populate('managerId')
      .populate('staffId');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Eroare la obținerea utilizatorilor.' });
  }
});
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

    // Setăm calea imaginii în funcție de rol
    let imagePath = req.file ? `/${getDestination(role)}/${req.file.filename}` : null;

    // Gestionăm rolurile specifice
    if (role === 'player') {
      if (!playerDetails) {
        return res.status(400).json({ message: 'Detaliile jucătorului sunt necesare pentru rolul de player!' });
      }

      const parsedPlayerDetails = typeof playerDetails === 'string' ? JSON.parse(playerDetails) : playerDetails;
      const {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        height,
        weight,
        history,
        position,          // Nou
        shirtNumber,      // Nou
        phoneNumber,      // Nou
        preferredFoot,    // Nou
        status            // Nou
      } = parsedPlayerDetails;

      // Verificare câmpuri obligatorii pentru Player
      if (!firstName || !lastName || !dateOfBirth || !nationality || !height || !weight || !position || !preferredFoot) {
        return res.status(400).json({ message: 'Toate câmpurile obligatorii pentru Player sunt necesare!' });
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
        position,
        shirtNumber: shirtNumber ? Number(shirtNumber) : undefined, // Opțional
        phoneNumber, // Opțional
        preferredFoot,
        status // Opțional, va folosi valoarea implicită dacă nu e specificat
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
      newUser.managerId = savedManager._id;
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
      newUser.staffId = savedStaff._id;
    }

    // Salvează utilizatorul cu ID-urile asociate (dacă există)
    newUser = await newUser.save();

    res.status(201).json({ message: 'Utilizator adăugat cu succes!', user: newUser });
  } catch (error) {
    console.error('Eroare la adăugarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la adăugarea utilizatorului.', error: error.message });
  }
});
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, playerDetails, managerDetails, staffDetails } = req.body;

  try {
    // Găsește utilizatorul existent
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Actualizează câmpurile de bază
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    // Logăm datele primite pentru depanare
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    // Actualizează detaliile specifice rolului
    if (role === 'player' && playerDetails) {
      let player = await Player.findById(user.playerId);
      if (player) {
        const parsedPlayerDetails = typeof playerDetails === 'string' ? JSON.parse(playerDetails) : playerDetails;
        
        // Destructurăm noile câmpuri
        const {
          firstName,
          lastName,
          dateOfBirth,
          nationality,
          height,
          weight,
          history,
          position,          // Nou
          shirtNumber,      // Nou
          phoneNumber,      // Nou
          preferredFoot,    // Nou
          status            // Nou
        } = parsedPlayerDetails;

        // Actualizează câmpurile playerDetails
        player.firstName = firstName || player.firstName;
        player.lastName = lastName || player.lastName;
        player.dateOfBirth = dateOfBirth || player.dateOfBirth;
        player.nationality = nationality || player.nationality;
        player.height = height || player.height;
        player.weight = weight || player.weight;
        player.history = history || player.history;
        // Actualizează noile câmpuri
        player.position = position || player.position;
        player.shirtNumber = shirtNumber !== undefined ? Number(shirtNumber) : player.shirtNumber;
        player.phoneNumber = phoneNumber !== undefined ? phoneNumber : player.phoneNumber;
        player.preferredFoot = preferredFoot || player.preferredFoot;
        player.status = status || player.status;

        // Actualizează imaginea doar dacă s-a încărcat una nouă
        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          player.image = imagePath;
        } else if (parsedPlayerDetails.image) {
          // Dacă imaginea nu s-a schimbat, păstrează calea veche
          player.image = parsedPlayerDetails.image;
        }

        await player.save();
      }
    } else if (role === 'manager' && managerDetails) {
      let manager = await Manager.findById(user.managerId);
      if (manager) {
        const parsedManagerDetails = typeof managerDetails === 'string' ? JSON.parse(managerDetails) : managerDetails;
        
        manager.firstName = parsedManagerDetails.firstName || manager.firstName;
        manager.lastName = parsedManagerDetails.lastName || manager.lastName;
        manager.dateOfBirth = parsedManagerDetails.dateOfBirth || manager.dateOfBirth;
        manager.nationality = parsedManagerDetails.nationality || manager.nationality;
        manager.history = parsedManagerDetails.history || manager.history;

        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          manager.image = imagePath;
        } else if (parsedManagerDetails.image) {
          manager.image = parsedManagerDetails.image;
        }

        await manager.save();
      }
    } else if (role === 'staff' && staffDetails) {
      let staff = await Staff.findById(user.staffId);
      if (staff) {
        const parsedStaffDetails = typeof staffDetails === 'string' ? JSON.parse(staffDetails) : staffDetails;
        
        staff.firstName = parsedStaffDetails.firstName || staff.firstName;
        staff.lastName = parsedStaffDetails.lastName || staff.lastName;
        staff.dateOfBirth = parsedStaffDetails.dateOfBirth || staff.dateOfBirth;
        staff.nationality = parsedStaffDetails.nationality || staff.nationality;
        staff.role = parsedStaffDetails.role || staff.role;
        staff.history = parsedStaffDetails.history || staff.history;
        staff.certifications = parsedStaffDetails.certifications || staff.certifications;

        if (req.file) {
          const imagePath = `/${getDestination(role)}/${req.file.filename}`;
          staff.image = imagePath;
        } else if (parsedStaffDetails.image) {
          staff.image = parsedStaffDetails.image;
        }

        await staff.save();
      }
    }

    // Salvează utilizatorul actualizat
    await user.save();
    res.status(200).json({ message: 'Utilizator actualizat cu succes!', user });
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea utilizatorului.', error: error.message });
  }
});


module.exports = router;


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
    // Căutăm utilizatorul în baza de date și îl ștergem
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit!' });
    }

    // Obținem rolul utilizatorului și determinăm folderul asociat
    const role = user.role || 'other';
    const folderPath = path.join(__dirname, '..', getDestination(role));

    // Construim numele fișierului (email-ul înlocuind '@' cu '_')
    const emailPrefix = email.replace('@', '_');
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    let imageDeleted = false;

    for (const ext of possibleExtensions) {
      const filePath = path.join(folderPath, `${emailPrefix}.${ext}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Șterge fișierul
        imageDeleted = true;
        break;
      }
    }

    res.status(200).json({ 
      message: 'Utilizator șters cu succes!',
      imageDeleted: imageDeleted ? 'Imaginea asociată a fost ștearsă.' : 'Nicio imagine găsită pentru acest utilizator.'
    });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea utilizatorului.' });
  }
});

module.exports = router;
