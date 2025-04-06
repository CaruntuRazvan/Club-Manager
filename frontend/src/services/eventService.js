// Obține toate evenimentele pentru un utilizator
export const getEvents = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Eroare la obținerea evenimentelor');
  }

  const data = await response.json();
  return data;
};

// POST pentru crearea unui eveniment (pentru manageri și staff)
export const createEvent = async (eventData) => {
  const response = await fetch(`http://localhost:5000/api/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la crearea evenimentului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Obține detaliile unui eveniment specific, inclusiv utilizatorii asociați
export const getEventDetails = async (eventId) => {
  const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la obținerea detaliilor evenimentului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};
// Șterge un eveniment
export const deleteEvent = async (eventId) => {
  const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea evenimentului: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// PUT pentru editarea unui eveniment existent (pentru manageri și staff)
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eroare la editarea evenimentului: ${errorText || 'Server error'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare în updateEvent:', error);
    throw error;
  }
};