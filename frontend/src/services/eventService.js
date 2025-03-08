export const getEvents = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/events?playerId=${userId}`, {
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