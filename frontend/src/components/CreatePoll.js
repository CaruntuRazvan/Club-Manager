import React, { useState } from 'react';
import { createPoll } from '../services/pollService';

const CreatePoll = ({ onPollCreated }) => {
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresDate: '', // Data în format dd/mm/yyyy
    expiresTime: '', // Ora în format hh:mm (24 ore)
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);

      // Validare întrebare
      if (!newPoll.question.trim()) {
        throw new Error('Întrebarea este obligatorie și nu poate fi goală.');
      }
      if (newPoll.question.length > 200) {
        throw new Error('Întrebarea nu poate avea mai mult de 200 de caractere.');
      }

      // Validare opțiuni
      const validOptions = newPoll.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        throw new Error('Trebuie să existe cel puțin 2 opțiuni valide.');
      }
      if (validOptions.length > 10) {
        throw new Error('Nu poți avea mai mult de 10 opțiuni.');
      }
      // Verificăm opțiuni duplicate (ignorăm case-ul)
      const uniqueOptions = new Set(validOptions.map(opt => opt.toLowerCase()));
      if (uniqueOptions.size !== validOptions.length) {
        throw new Error('Opțiunile nu pot fi duplicate.');
      }
      // Verificăm lungimea fiecărei opțiuni
      validOptions.forEach((opt, index) => {
        if (opt.length > 100) {
          throw new Error(`Opțiunea ${index + 1} nu poate avea mai mult de 100 de caractere.`);
        }
      });

      // Validare dată (dd/mm/yyyy)
      let expiresAt = undefined;
      if (newPoll.expiresDate || newPoll.expiresTime) {
        // Dacă unul dintre câmpuri este completat, ambele trebuie să fie
        if (!newPoll.expiresDate || !newPoll.expiresTime) {
          throw new Error('Trebuie să completezi atât data, cât și ora de expirare.');
        }

        // Validare format dată
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newPoll.expiresDate)) {
          throw new Error('Data trebuie să fie în format dd/mm/yyyy (ex. 31/03/2025).');
        }

        // Validare format oră
        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(newPoll.expiresTime)) {
          throw new Error('Ora trebuie să fie în format hh:mm (ex. 09:00 sau 21:00).');
        }

        // Construim data și verificăm validitatea
        const [day, month, year] = newPoll.expiresDate.split('/');
        const [hours, minutes] = newPoll.expiresTime.split(':');
        const parsedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

        if (isNaN(parsedDate.getTime())) {
          throw new Error('Data sau ora introdusă nu este validă.');
        }

        // Verificăm dacă data este în viitor
        const now = new Date();
        if (parsedDate <= now) {
          throw new Error('Data de expirare trebuie să fie în viitor.');
        }

        expiresAt = parsedDate.toISOString();
      }

      const pollData = {
        question: newPoll.question,
        options: validOptions,
        expiresAt,
      };
      await createPoll(pollData);
      setSuccessMessage('Sondaj creat cu succes!');
      setNewPoll({ question: '', options: ['', ''], expiresDate: '', expiresTime: '' });
      if (onPollCreated) onPollCreated();
    } catch (error) {
      setError(error.message || 'Eroare la crearea sondajului.');
    }
  };

  const handleAddOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  return (
    <div className="create-poll">
      <h3>Creează un sondaj nou</h3>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleCreatePoll}>
        <div className="form-group">
          <label>Întrebare:</label>
          <input
            type="text"
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Opțiuni:</label>
          {newPoll.options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Opțiunea ${index + 1}`}
              required
            />
          ))}
          <button type="button" onClick={handleAddOption} className="add-option-btn">
            Adaugă opțiune
          </button>
        </div>
        <div className="form-group">
          <label>Data de expirare (opțional):</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={newPoll.expiresDate}
            onChange={(e) => setNewPoll({ ...newPoll, expiresDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Ora de expirare (opțional):</label>
          <input
            type="text"
            placeholder="hh:mm"
            value={newPoll.expiresTime}
            onChange={(e) => setNewPoll({ ...newPoll, expiresTime: e.target.value })}
          />
        </div>
        <button type="submit" className="submit-btn">
          Creează sondaj
        </button>
      </form>
    </div>
  );
};

export default CreatePoll;