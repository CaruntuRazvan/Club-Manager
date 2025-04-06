import React, { useState, useEffect } from 'react';
import { voteInPoll, fetchPolls, fetchPollById, deletePoll } from '../services/pollService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/PollsList.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PollsList = ({ userId, userRole }) => {
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchPollsData();
  }, []);

  const fetchPollsData = async () => {
    try {
      setError(null);
      const data = await fetchPolls();
      setPolls(data);
    } catch (error) {
      setError(error.message || 'Eroare la preluarea sondajelor.');
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await voteInPoll(pollId, optionIndex);
      setSuccessMessage('Vot înregistrat cu succes!');
      fetchPollsData();
      if (selectedPollId === pollId) {
        fetchPollResults(pollId);
      }
    } catch (error) {
      setError(error.message || 'Eroare la votare.');
    }
  };

  const fetchPollResults = async (pollId) => {
    try {
      setError(null);
      const data = await fetchPollById(pollId);
      setSelectedPollId(pollId);
      setResults(data.results);
    } catch (error) {
      setError(error.message || 'Eroare la preluarea rezultatelor.');
    }
  };

  const togglePollResults = (pollId) => {
    if (selectedPollId === pollId) {
      // Dacă rezultatele sunt deja afișate, le ascundem
      setSelectedPollId(null);
      setResults(null);
    } else {
      // Dacă nu sunt afișate, le fetch-uim și le afișăm
      fetchPollResults(pollId);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest sondaj?')) {
      try {
        await deletePoll(pollId);
        setSuccessMessage('Sondaj șters cu succes!');
        fetchPollsData();
      } catch (error) {
        setError(error.message || 'Eroare la ștergerea sondajului');
      }
    }
  };

  const chartData = results
    ? {
        labels: results.map(result => result.text),
        datasets: [
          {
            label: 'Număr de voturi',
            data: results.map(result => result.voteCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} voturi (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <section className="polls-section">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="polls-list">
        {polls.length === 0 ? (
          <p>Nu există sondaje disponibile.</p>
        ) : (
          polls.map((poll) => (
            <div key={poll._id} className="poll-item">
              <h4>{poll.question}</h4>
              <p>Creat de: {poll.createdBy?.name || 'Utilizator necunoscut'}</p>
              {poll.expiresAt && (
                <p>Expiră la: {new Date(poll.expiresAt).toLocaleString()}</p>
              )}
              {poll.hasVoted || userRole === 'manager' || userRole === 'staff' ? (
                <button onClick={() => togglePollResults(poll._id)} className="view-results-btn">
                  {selectedPollId === poll._id ? 'Ascunde rezultatele' : 'Vezi rezultatele'}
                </button>
              ) : (
                <div className="poll-options">
                  {poll.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleVote(poll._id, index)}
                      className="vote-btn"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}
              {/* Butonul de ștergere în colțul dreapta-sus */}
              {(userRole === 'manager' || userRole === 'staff') && poll.createdBy._id === userId && (
                <button onClick={() => handleDeletePoll(poll._id)} className="delete-poll-btn" title="Șterge sondaj">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                  </svg>
                </button>
              )}
              {/* Afișăm rezultatele sub sondajul selectat */}
              {selectedPollId === poll._id && results && (
                <div className="poll-results">
                  <h3>Rezultate: {poll.question}</h3>
                  <div className="chart-container">
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PollsList;