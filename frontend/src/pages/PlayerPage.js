import React, { useState, useEffect, useRef } from 'react';
import { fetchCurrentUser } from '../services/userService';
import AboutTeam from './AboutTeam';
import PlayersSection from '../components/PlayersSection';
import EventCalendar from '../components/EventCalendar';
import UserProfile from '../components/UserProfile';
import PollsList from '../components/PollsList';  
import NotificationsDropdown from '../components/NotificationsDropdown'; 
import '../styles/PlayerPage.css';
import '../styles/GlobalStyles.css';

const PlayerPage = ({ userId, handleLogout }) => {
  const [playerInfo, setPlayerInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [eventColor, setEventColor] = useState(() => {
    return localStorage.getItem(`eventColor_${userId}`) || '#3788d8';
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const settingsModalRef = useRef(null);
  const role = 'player';

  useEffect(() => {
    const loadPlayerInfo = async () => {
      if (!userId || !role) {
        console.error('No userId or role provided!');
        return;
      }

      try {
        const playerData = await fetchCurrentUser(userId, role);
        console.log('Date primite de la fetchCurrentUser pentru player:', playerData);
        setPlayerInfo(playerData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor player:', error);
      }
    };

    loadPlayerInfo();
  }, [userId, role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleColorChange = (color) => {
    localStorage.setItem(`eventColor_${userId}`, color);
    setEventColor(color);
    setIsSettingsOpen(false);
  };

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  const handleLogoutWithConfirm = () => {
    const confirmLogout = window.confirm('Ești sigur că vrei să te deconectezi?');
    if (confirmLogout) {
      handleLogout();
    }
  };

  const predefinedColors = [
    { name: 'Roșu Cărămidă', value: '#c0392b' },
    { name: 'Galben Auriu', value: '#f1c40f' },
    { name: 'Mov Regal', value: '#8e44ad' },
    { name: 'Albastru Deschis', value: '#3498db' },
    { name: 'Verde Măsliniu', value: '#27ae60' },
    { name: 'Roz Coral', value: '#e91e63' },
  ];

  return (
    <div className="player-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" />
        {playerInfo && (
          <div className="player-profile">
            <p><strong>User:</strong> {playerInfo.name}</p>
            <p><strong>Email:</strong> {playerInfo.email}</p>
          </div>
        )}
        <ul>
          <li
            className={activeSection === 'team' ? 'active' : ''}
            onClick={() => setActiveSection('team')}
          >
            Despre Echipa
          </li>
          <li
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => setActiveSection('profile')}
          >
            Profilul Meu
          </li>
          <li
            className={activeSection === 'players' ? 'active' : ''}
            onClick={() => setActiveSection('players')}
          >
            Jucatori
          </li>
          <li
            className={activeSection === 'calendar' ? 'active' : ''}
            onClick={() => setActiveSection('calendar')}
          >
            Calendar
          </li>
          <li
            className={activeSection === 'polls' ? 'active' : ''}
            onClick={() => setActiveSection('polls')}
          >
            Sondaje
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Player Dashboard</h1>
          <div className="header-actions">
            <NotificationsDropdown userId={userId} /> {/* Adaugă componenta */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="settings-btn"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-gear"
                viewBox="0 0 16 16"
              >
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.433 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l-.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
              </svg>
            </button>
            <button onClick={handleLogoutWithConfirm} className="logout-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-box-arrow-right"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
              </svg>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Modal de setări */}
        {isSettingsOpen && (
          <div className="settings-modal-overlay">
            <div className="settings-modal" ref={settingsModalRef}>
              <button
                className="modal-close-btn"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Închide"
              >
                X
              </button>
              <h2>Setări</h2>
              <div className="settings-content">
                <label>Culoare evenimente:</label>
                <div className="color-options">
                  {predefinedColors.map((color) => (
                    <div
                      key={color.value}
                      className={`color-option ${eventColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secțiunea Profilul Meu */}
        {activeSection === 'profile' && playerInfo && (
          <section className="profile-section">
            <h2>Profilul Meu</h2>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {playerInfo.playerId?.image ? (
                    <img src={`http://localhost:5000${playerInfo.playerId.image}`} alt="Profile" className="profile-image" />
                  ) : (
                    <span>{playerInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                  )}
                </div>
                <h3 className="profile-name">{playerInfo.playerId?.firstName} {playerInfo.playerId?.lastName}</h3>
                <span className="profile-role">Jucător</span>
              </div>

              <div className="profile-details">
                <h4>Informații personale</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Prenume:</span>
                    <span className="info-value">{playerInfo.playerId?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nume:</span>
                    <span className="info-value">{playerInfo.playerId?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vârsta:</span>
                    <span className="info-value">{calculateAge(playerInfo.playerId?.dateOfBirth)} ani</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Naționalitate:</span>
                    <span className="info-value">{playerInfo.playerId?.nationality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Înălțime:</span>
                    <span className="info-value">{playerInfo.playerId?.height} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Greutate:</span>
                    <span className="info-value">{playerInfo.playerId?.weight} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{playerInfo.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Poziție:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.position === 'Goalkeeper' ? 'Portar' :
                      playerInfo.playerId?.position === 'Defender' ? 'Fundaș' :
                      playerInfo.playerId?.position === 'Midfielder' ? 'Mijlocaș' :
                      playerInfo.playerId?.position === 'Forward' ? 'Atacant' :
                      playerInfo.playerId?.position || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Număr tricou:</span>
                    <span className="info-value">{playerInfo.playerId?.shirtNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Număr de telefon:</span>
                    <span className="info-value">{playerInfo.playerId?.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Picior preferat:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.preferredFoot === 'right' ? 'Drept' :
                      playerInfo.playerId?.preferredFoot === 'left' ? 'Stâng' :
                      playerInfo.playerId?.preferredFoot === 'both' ? 'Ambele' :
                      playerInfo.playerId?.preferredFoot || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stare:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.status === 'notInjured' ? 'Nu este accidentat' :
                      playerInfo.playerId?.status === 'recovering' ? 'În recuperare' :
                      playerInfo.playerId?.status === 'injured' ? 'Accidentat' :
                      playerInfo.playerId?.status || 'N/A'}
                    </span>
                  </div>
                </div>

                {playerInfo.playerId?.history && playerInfo.playerId.history.length > 0 && (
                  <div className="profile-section">
                    <h4>Istoric cluburi</h4>
                    <ul className="history-list">
                      {playerInfo.playerId.history.map((entry, index) => (
                        <li key={index}>
                          {entry.club} ({entry.startYear} - {entry.endYear})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Secțiunea Despre Echipa */}
        {activeSection === 'team' && <AboutTeam />}

        {/* Secțiunea Jucatori */}
        {activeSection === 'players' && (
          <PlayersSection
            onPlayerClick={handleOpenProfile}
            currentUserId={userId}
          />
        )}

        {/* Secțiunea Calendar */}
        {activeSection === 'calendar' && (
          <section className="calendar-section">
            <h2>Calendar Evenimente</h2>
            <EventCalendar userId={userId} eventColor={eventColor} />
          </section>
        )}

        {/* Secțiunea Sondaje */}
       {activeSection === 'polls' && (
        <section className="polls-section">
          <PollsList userId={userId} userRole={role} />
        </section>
        )}  

        {/* Modal pentru profilul jucătorului selectat */}
        {selectedUser && (
          <UserProfile
            user={selectedUser}
            onClose={handleCloseProfile}
            calculateAge={calculateAge}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerPage;