import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEvents, getEventDetails, deleteEvent } from '../services/eventService';
import { getFeedbackForEvent } from '../services/feedbackService';
import AddFeedbackModal from './AddFeedbackModal';
import FeedbackList from './FeedbackList';
import '../styles/EventCalendar.css';

const EventCalendar = ({ userId, eventColor }) => {
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Funcție pentru a calcula culoarea textului în funcție de fundal
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Încarcă evenimentele inițiale și verifică feedback-urile
  const fetchEvents = async () => {
    try {
      const eventData = await getEvents(userId);
      let calendarEvents = eventData
        .filter(event => {
          if (userRole === 'player') {
            return event.players.some(player => player._id === userId);
          }
          return true; // Managerii văd toate evenimentele
        })
        .map(event => ({
          id: event._id,
          title: event.title,
          start: event.startDate,
          end: event.finishDate,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: getContrastColor(eventColor),
          hasFeedback: false,
        }));

      // Preluăm feedback-urile pentru toate evenimentele
      for (let event of calendarEvents) {
        try {
          const feedbackData = await getFeedbackForEvent(event.id);
          if (userRole === 'player') {
            event.hasFeedback = feedbackData.some(feedback => feedback.receiverId._id === userId);
          } else if (userRole === 'manager') {
            event.hasFeedback = feedbackData.length > 0;
          }
        } catch (error) {
          console.error(`Eroare la preluarea feedback-urilor pentru evenimentul ${event.id}:`, error);
          event.hasFeedback = false;
        }
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Eroare la încărcarea evenimentelor:', error);
      toast.error('Eroare la încărcarea evenimentelor.', {
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role || '');
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchEvents();
    }
  }, [userId, eventColor, userRole]);

  // Funcție pentru a gestiona clicurile pe evenimente
  const handleEventClick = async (info) => {
    const eventId = info.event.id;
    try {
      const eventData = await getEventDetails(eventId);
      const feedbackData = await getFeedbackForEvent(eventId);
      setFeedbacks(feedbackData);
      setEventDetails({ ...eventData, feedbacks: feedbackData });
      setSelectedEvent(info.event);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Eroare la obținerea detaliilor evenimentului:', error);
      toast.error(error.message || 'Nu ai permisiunea de a vedea detaliile acestui eveniment.', {
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  // Funcție pentru a șterge evenimentul
  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi acest eveniment?');
    if (confirmDelete) {
      try {
        await deleteEvent(eventId);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        closeModal();
        toast.success('Eveniment șters!', {
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
          style: {
            background: '#28a745',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '4px',
          },
        });
      } catch (error) {
        console.error('Eroare la ștergerea evenimentului:', error);
        toast.error('Eroare la ștergere!', {
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
          style: {
            background: '#dc3545',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '4px',
          },
        });
      }
    }
  };

  // Funcție pentru a închide modalul
  const closeModal = () => {
    setIsModalOpen(false);
    setShowFeedbackModal(false);
    setSelectedEvent(null);
    setEventDetails(null);
    setFeedbacks([]);
  };

  // Funcție pentru a închide modalul la clic în afara lui
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay') && !showFeedbackModal) {
      closeModal();
    }
  };

  // Funcție pentru a deschide modalul de feedback
  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  // Funcție pentru a închide modalul de feedback
  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  // Funcție pentru a reîmprospăta feedback-urile după adăugare
  const handleFeedbackAdded = async () => {
    try {
      const feedbackData = await getFeedbackForEvent(eventDetails._id);
      setFeedbacks(feedbackData);
      setEventDetails({ ...eventDetails, feedbacks: feedbackData });
      setShowFeedbackModal(false);
      await fetchEvents();
    } catch (error) {
      console.error('Eroare la reîmprospătarea feedback-urilor:', error);
    }
  };

  // Formatează data pentru afișare
  const formatDate = (date) => {
    return new Date(date).toLocaleString('ro-RO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Funcție pentru a personaliza conținutul evenimentului
  const renderEventContent = (eventInfo) => {
    return (
      <div className="custom-event-content">
        <span>{eventInfo.event.title}</span>
        {eventInfo.event.extendedProps.hasFeedback && (
          <span className="feedback-icon">💬</span>
        )}
      </div>
    );
  };

  return (
    <div
      className="event-calendar-container"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999, position: 'fixed', bottom: 0, left: 0, width: 'auto' }}
      />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={events}
        locale="ro"
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="600px"
        contentHeight="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        buttonText={{
          today: 'Astăzi',
          month: 'Lună',
          week: 'Săptămână',
          day: 'Zi',
          list: 'Listă',
        }}
        dayMaxEvents={true}
        views={{
          timeGridWeek: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
          timeGridDay: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
        }}
        eventContent={renderEventContent} // Personalizăm afișarea evenimentelor
        eventClick={handleEventClick}
      />

      {isModalOpen && eventDetails && (
        <div
          className={`event-modal-overlay ${showFeedbackModal ? 'event-modal-overlay-inactive' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className="event-modal-content event-details-modal">
            <div className="event-modal-header">
              {eventDetails.createdBy && eventDetails.createdBy._id === userId && userRole === 'manager' && (
                <button
                  className="event-modal-delete-btn"
                  onClick={() => handleDeleteEvent(eventDetails._id)}
                  aria-label="Șterge eveniment"
                >
                  <i className="fas fa-trash-alt"></i> Șterge
                </button>
              )}
              <button
                className="event-modal-close-btn"
                onClick={closeModal}
                aria-label="Închide"
              >
                X
              </button>
            </div>
            <h2>{eventDetails.title}</h2>
            <div className="event-details-content">
              <p><strong>Descriere:</strong> {eventDetails.description}</p>
              <p><strong>Data de început:</strong> {formatDate(eventDetails.startDate)}</p>
              <p><strong>Data de sfârșit:</strong> {formatDate(eventDetails.finishDate)}</p>
              <p><strong>Status:</strong> {eventDetails.status}</p>
              <p>
                <strong>Creat de:</strong>{' '}
                {eventDetails.createdBy
                  ? `${eventDetails.createdBy.name} (${eventDetails.createdBy.email})`
                  : 'Necunoscut'}
              </p>

              {eventDetails.players && eventDetails.players.length > 0 ? (
                <div>
                  <h4>Jucători:</h4>
                  <ul className="event-participants-list">
                    {eventDetails.players.map((player) => (
                      <li key={player._id}>
                        {player.playerId
                          ? `${player.playerId.firstName} ${player.playerId.lastName}`
                          : player.name}{' '}
                        ({player.email})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Jucători:</strong> Niciun jucător asociat.</p>
              )}

              {eventDetails.staff && eventDetails.staff.length > 0 ? (
                <div>
                  <h4>Staff:</h4>
                  <ul className="event-participants-list">
                    {eventDetails.staff.map((staff) => (
                      <li key={staff._id}>
                        {staff.staffId
                          ? `${staff.staffId.firstName} ${staff.staffId.lastName}`
                          : staff.name}{' '}
                        ({staff.email})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Staff:</strong> Niciun membru al staff-ului asociat.</p>
              )}

              {userRole === 'manager' && eventDetails.createdBy && eventDetails.createdBy._id === userId && (
                <button
                  className="event-add-feedback-btn"
                  onClick={handleOpenFeedbackModal}
                >
                  Adaugă feedback
                </button>
              )}

              <FeedbackList feedbacks={feedbacks} userRole={userRole} />
            </div>
          </div>
        </div>
      )}

      {/* Modal pentru adăugarea feedback-ului */}
      {showFeedbackModal && eventDetails && (
        <AddFeedbackModal
          event={eventDetails}
          onClose={handleCloseFeedbackModal}
          onFeedbackAdded={handleFeedbackAdded}
        />
      )}
    </div>
  );
};

export default EventCalendar;