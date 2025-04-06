const API_URL = 'http://localhost:5000/api/polls';

// Funcție pentru crearea unui sondaj nou
export const createPoll = async (pollData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pollData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la crearea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la crearea sondajului:', error);
    throw error;
  }
};

// Funcție pentru votarea într-un sondaj
export const voteInPoll = async (pollId, optionIndex) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ optionIndex }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la votare' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la votare:', error);
    throw error;
  }
};

// Funcție pentru preluarea tuturor sondajelor
export const fetchPolls = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la preluarea sondajelor' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la preluarea sondajelor:', error);
    throw error;
  }
};

// Funcție pentru preluarea unui sondaj specific (inclusiv rezultatele)
export const fetchPollById = async (pollId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${pollId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la preluarea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la preluarea sondajului:', error);
    throw error;
  }
};
// Funcție pentru ștergerea unui sondaj
export const deletePoll = async (pollId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${pollId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea sondajului:', error);
    throw error;
  }
};