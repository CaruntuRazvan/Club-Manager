// notificationService.js
const API_URL = 'http://localhost:5000/api/notifications';

// Preluare notificări pentru un utilizator
export const getNotificationsForUser = async (userId) => {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea notificărilor: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Marcarea unei notificări ca citită
export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la marcarea notificării ca citită: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Ștergerea unei notificări
export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_URL}/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea notificării: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};