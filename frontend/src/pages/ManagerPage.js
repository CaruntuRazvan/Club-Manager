import React, { useState, useEffect, useRef } from 'react';
import { fetchCurrentUser, fetchPlayers } from '../services/userService';
import AboutTeam from './AboutTeam';
import PlayersSection from '../components/PlayersSection';
import UserProfile from '../components/UserProfile';
import EventCalendar from '../components/EventCalendar';
import { getEvents } from '../services/eventService';
import CreateEventForm from '../components/CreateEventForm';
import ManagerCharts from '../components/ManagerCharts';
import CreatePoll from '../components/CreatePoll'; 
import PollsList from '../components/PollsList';
import NotificationsDropdown from '../components/NotificationsDropdown';   
import '../styles/ManagerPage.css';
import '../styles/GlobalStyles.css';

const ManagerPage = ({ userId, handleLogout }) => {
  const [managerInfo, setManagerInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [eventColor, setEventColor] = useState(() => {
    return localStorage.getItem(`eventColor_${userId}`) || '#3788d8';
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [playersByPosition, setPlayersByPosition] = useState({});
  const [ageDistribution, setAgeDistribution] = useState({});
  const [nationalities, setNationalities] = useState({});
  const [medicalStatus, setMedicalStatus] = useState({});
  const [preferredFoot, setPreferredFoot] = useState({});
  const [averageAge, setAverageAge] = useState(0);
  const [shirtNumbers, setShirtNumbers] = useState({});
  const settingsModalRef = useRef(null);
  const createEventModalRef = useRef(null);
  const createPollModalRef = useRef(null);
  const role = 'manager';

  useEffect(() => {
    const loadManagerInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const managerData = await fetchCurrentUser(userId, role);
        console.log('Date manager:', managerData);
        setManagerInfo(managerData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor managerului:', error);
      }
    };

    loadManagerInfo();
  }, [userId, role]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventData = await getEvents(userId);
        setEvents(eventData);
      } catch (err) {
        setError('Eroare la obținerea evenimentelor.');
        console.error('Eroare la încărcarea evenimentelor:', err);
      }
    };
    loadEvents();
  }, [userId]);

  // Încărcăm datele pentru grafice
  useEffect(() => {
    const loadPlayersData = async () => {
      try {
        const players = await fetchPlayers();

        // 1. Distribuția pe poziții
        const positions = players.reduce((acc, player) => {
          const position = player.playerId?.position || 'Unknown';
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});
        setPlayersByPosition(positions);

        // 2. Distribuția vârstelor
        const ageDist = { '18-22': 0, '23-27': 0, '28-32': 0, '33+': 0 };
        let totalAge = 0;
        let playerCount = 0;
        players.forEach((player) => {
          const birthDate = new Date(player.playerId?.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          totalAge += age;
          playerCount++;
          if (age >= 18 && age <= 22) ageDist['18-22']++;
          else if (age >= 23 && age <= 27) ageDist['23-27']++;
          else if (age >= 28 && age <= 32) ageDist['28-32']++;
          else if (age >= 33) ageDist['33+']++;
        });
        setAgeDistribution(ageDist);
        setAverageAge(playerCount > 0 ? totalAge / playerCount : 0);

        // 3. Distribuția naționalităților
        const natDist = players.reduce((acc, player) => {
          const nationality = player.playerId?.nationality || 'Unknown';
          acc[nationality] = (acc[nationality] || 0) + 1;
          return acc;
        }, {});
        setNationalities(natDist);

        // 4. Statusul medical
        const medStatus = players.reduce((acc, player) => {
          const status = player.playerId?.status || 'Unknown'; // Presupunem că există această proprietate
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { notInjured: 0, recovering: 0, injured: 0 });
        setMedicalStatus(medStatus);

        // 5. Piciorul preferat
        const footDist = players.reduce((acc, player) => {
          const foot = player.playerId?.preferredFoot || 'Unknown'; // Presupunem că există această proprietate
          acc[foot] = (acc[foot] || 0) + 1;
          return acc;
        }, { right: 0, left: 0, both: 0 });
        setPreferredFoot(footDist);

        // 6. Distribuția numerelor de tricou
        const shirtDist = players.reduce((acc, player) => {
          const number = player.playerId?.shirtNumber || 'Unassigned'; // Presupunem că există această proprietate
          acc[number] = (acc[number] || 0) + 1;
          return acc;
        }, {});
        setShirtNumbers(shirtDist);

      } catch (error) {
        console.error('Eroare la preluarea datelor jucătorilor:', error);
      }
    };
    loadPlayersData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (createEventModalRef.current && !createEventModalRef.current.contains(event.target)) {
        setIsCreateEventModalOpen(false);
      }
      if (createPollModalRef.current && !createPollModalRef.current.contains(event.target)) {
        setIsCreatePollModalOpen(false);
      }
    };

    const isAnyModalOpen = isSettingsOpen || isCreateEventModalOpen || isCreatePollModalOpen;
    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, isCreateEventModalOpen, isCreatePollModalOpen]);
  
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

  const handleEventCreated = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
    setIsCreateEventModalOpen(false);
  };
  const handlePollCreated = () => {
    setIsCreatePollModalOpen(false);
    // Poți adăuga logica pentru a reîmprospăta lista de sondaje dacă dorești
  }
  const handleLogoutWithConfirmation = () => {
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
    <div className="manager-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" />
        {managerInfo && (
          <div className="manager-profile">
            <p><strong>User:</strong> {managerInfo.name}</p>
            <p><strong>Email:</strong> {managerInfo.email}</p>
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
            className={activeSection === 'create-event' ? 'active' : ''}
            onClick={() => setActiveSection('create-event')}
          >
            Cereri
          </li>
          <li
            className={activeSection === 'statistics' ? 'active' : ''}
            onClick={() => setActiveSection('statistics')}
          >
            Statistici
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
          <h1>Manager Dashboard</h1>
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
            <button onClick={handleLogoutWithConfirmation} className="logout-btn">
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
        {activeSection === 'profile' && managerInfo && (
          <section className="profile-section">
            <h2>Profilul Meu</h2>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {managerInfo.managerId?.image ? (
                    <img src={`http://localhost:5000${managerInfo.managerId.image}`} alt="Profile" className="profile-image" />
                  ) : (
                    <span>{managerInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                  )}
                </div>
                <h3 className="profile-name">{managerInfo.managerId?.firstName} {managerInfo.managerId?.lastName}</h3>
                <span className="profile-role">Manager</span>
              </div>

              <div className="profile-details">
                <h4>Informații personale</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Prenume:</span>
                    <span className="info-value">{managerInfo.managerId?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nume:</span>
                    <span className="info-value">{managerInfo.managerId?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vârsta:</span>
                    <span className="info-value">{calculateAge(managerInfo.managerId?.dateOfBirth)} ani</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Naționalitate:</span>
                    <span className="info-value">{managerInfo.managerId?.nationality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{managerInfo.email}</span>
                  </div>
                </div>

                {managerInfo.managerId?.history && managerInfo.managerId.history.length > 0 && (
                  <div className="profile-section">
                    <h4>Istoric cluburi</h4>
                    <ul className="history-list">
                      {managerInfo.managerId.history.map((entry, index) => (
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
          />
        )}

        {/* Secțiunea Calendar */}
        {activeSection === 'calendar' && (
          <section className="calendar-section">
            <h2>Calendar Evenimente</h2>
            <EventCalendar userId={userId} eventColor={eventColor} />
          </section>
        )}

        {/* Secțiunea Cereri - Include CreateEvent și CreatePoll */}
        {activeSection === 'create-event' && (
          <section className="create-event-section">
            <h2>Cereri</h2>
            <div className="requests-buttons">
              <button
                className="create-event-btn"
                onClick={() => setIsCreateEventModalOpen(true)}
              >
                Crează Eveniment
              </button>
              <button
                className="create-poll-btn"
                onClick={() => setIsCreatePollModalOpen(true)}
              >
                Crează Sondaj
              </button>
            </div>

            {/* Modal pentru crearea evenimentului */}
            {isCreateEventModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content" ref={createEventModalRef}>
                  <button
                    className="modal-close-btn"
                    onClick={() => setIsCreateEventModalOpen(false)}
                    aria-label="Închide"
                  >
                    X
                  </button>
                  <CreateEventForm onEventCreated={handleEventCreated} />
                </div>
              </div>
            )}

            {/* Modal pentru crearea sondajului */}
            {isCreatePollModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content" ref={createPollModalRef}>
                  <button
                    className="modal-close-btn"
                    onClick={() => setIsCreatePollModalOpen(false)}
                    aria-label="Închide"
                  >
                    X
                  </button>
                  <CreatePoll onPollCreated={handlePollCreated} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Secțiunea Statistici */}
        {activeSection === 'statistics' && (
          <section className="statistics-section">
            <h2>Statistici</h2>
            <ManagerCharts
              playersByPosition={playersByPosition}
              ageDistribution={ageDistribution}
              nationalities={nationalities}
              medicalStatus={medicalStatus}
              preferredFoot={preferredFoot}
              averageAge={averageAge}
              shirtNumbers={shirtNumbers}
            />
          </section>
        )}
       {/* Secțiunea Sondaje - Doar PollsList */}
        {activeSection === 'polls' && (
          <section className="polls-section">
            <PollsList userId={userId} userRole={role} />
          </section>
        )}
        {/* Modal pentru profilul utilizatorului selectat */}
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

export default ManagerPage;