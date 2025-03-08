import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../services/userService';
import '../styles/PlayersSection.css';

const PlayersSection = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const users = await fetchPlayers();
        console.log('Jucători preluați:', users); // Log pentru depanare
        setPlayers(users);
      } catch (err) {
        setError('Eroare la încărcarea jucătorilor.');
        console.error('Eroare fetchPlayers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  // Grupăm jucătorii pe categorii folosind atributul position din playerId
  const goalkeepers = players.filter(player => player.playerId?.position === 'Goalkeeper');
  const defenders = players.filter(player => player.playerId?.position === 'Defender');
  const midfielders = players.filter(player => player.playerId?.position === 'Midfielder');
  const forwards = players.filter(player => player.playerId?.position === 'Forward');

  // Funcție pentru a afișa o categorie de jucători
  const renderPlayerCategory = (categoryPlayers, categoryTitle) => (
    categoryPlayers.length > 0 && (
      <div className="player-category">
        <h2>{categoryTitle}</h2>
        <div className="players-list">
          {categoryPlayers.map(player => (
            <div key={player._id} className="player-card">
              <div className="player-image-wrapper">
                <div className="background-logo"></div>
                <img
                 src={
                 player.playerId?.image 
                ? `http://localhost:5000${player.playerId.image}`
                : '/images/default-user.jpg'
                  } 
                  alt={player.name}
                  className="player-image"
                  onError={(e) => {
                    e.target.src = '/path-to-placeholder-image.jpg';
                    console.log(`Eroare la încărcarea imaginii pentru ${player.name}`);
                  }}
                />
              </div>
              <div className="player-info">
                <span className="player-number">{player.playerId?.shirtNumber || 'N/A'}</span> {/* Ajustăm playerDetails la playerId */}
                <span className="player-name">{player.name.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  if (loading) return <div>Se încarcă jucătorii...</div>;
  if (error) return <div>{error}</div>;
  if (players.length === 0) return <div>Nu există jucători în lot.</div>;

  return (
    <div className="players-section">
      {renderPlayerCategory(goalkeepers, 'Portari')}
      {renderPlayerCategory(defenders, 'Fundași')}
      {renderPlayerCategory(midfielders, 'Mijlocași')}
      {renderPlayerCategory(forwards, 'Atacanți')}
    </div>
  );
};

export default PlayersSection;