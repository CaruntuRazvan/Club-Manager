// components/NotificationsDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificationsForUser, markNotificationAsRead, deleteNotification } from '../services/notificationService';
import '../styles/NotificationsDropdown.css';

const NotificationsDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Funcție pentru a prelua notificările
  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsForUser(userId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Eroare la preluarea notificărilor:', error.message);
    }
  };

  // Polling: Preluare notificări la fiecare 30 de secunde
  useEffect(() => {
    fetchNotifications(); // Prima preluare la montarea componentei

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 de secunde

    return () => clearInterval(interval); // Curăță intervalul la demontare
  }, [userId]);

  // Închide dropdown-ul dacă se face click în afara lui
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Funcție pentru a formata data (ex. "Acum 2 ore")
  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Acum câteva secunde';
    if (diffInSeconds < 3600) return `Acum ${Math.floor(diffInSeconds / 60)} minute`;
    if (diffInSeconds < 86400) return `Acum ${Math.floor(diffInSeconds / 3600)} ore`;
    if (diffInSeconds < 604800) return `Acum ${Math.floor(diffInSeconds / 86400)} zile`;
    return notificationDate.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Funcție pentru a marca o notificare ca citită și a redirecționa
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setUnreadCount((prev) => prev - 1);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      }
      navigate(notification.actionLink);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Eroare la marcarea notificării ca citită:', error.message);
    }
  };

  // Funcție pentru a șterge o notificare
  const handleDeleteNotification = async (notificationId, isRead) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!isRead) {
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Eroare la ștergerea notificării:', error.message);
    }
  };

  // Afișează maxim 5 notificări (cele mai recente)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="notifications-btn"
        title="Notificări"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-bell"
          viewBox="0 0 16 16"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          {recentNotifications.length === 0 ? (
            <div className="no-notifications">
              <p>Nu ai notificări noi.</p>
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div
                  className="notification-content"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.isRead && <span className="unread-dot"></span>}
                  <div className="notification-text">
                    <strong>{notification.title}</strong> - {notification.description}{' '}
                    <span className="notification-date">
                      ({formatDate(notification.createdAt)})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDeleteNotification(notification._id, notification.isRead)
                  }
                  className="delete-btn"
                  title="Șterge notificarea"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z" />
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;