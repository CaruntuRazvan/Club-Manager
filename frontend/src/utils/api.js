// Funcție reutilizabilă pentru a face cereri cu fetch, incluzând token-ul
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};



export const loginUser = async (email, password) => {
  const data = await apiFetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  //const data = await response.json();

  console.log('Răspuns de la backend:', data); // Debug pentru a verifica structura
  return data; // Returnează întregul răspuns (cu token, user, message)
};


export const verifyAuth = async () => {
  const token = localStorage.getItem('token'); // Presupunem că salvezi un token la login (vezi pasul 2)

  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch('http://localhost:5000/api/verify-auth', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Auth verification failed');
  }

  return data.user; // Returnează datele utilizatorului dacă autentificarea este validă
};