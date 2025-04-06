const API_URL = 'http://localhost:5000/api/feedbacks';

// Adăugare feedback
export const addFeedback = async (feedbackData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la adăugarea feedback-ului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Preluare feedback pentru un eveniment
export const getFeedbackForEvent = async (eventId) => {
  const response = await fetch(`${API_URL}/event/${eventId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea feedback-ului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};