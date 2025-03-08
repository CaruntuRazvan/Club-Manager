// userService.js
export const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    if (response.ok) {
      //console.error('Utilizatori preluați:', data);
      return data;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};
export const fetchPlayers = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    if (response.ok) {
      // Filtrăm doar utilizatorii cu rolul "player"
      const players = data.filter(user => user.role === 'player');
      console.log('Jucători preluați:', players);
      return players;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};
export const addUser = async (userData) => {
  try {
    const formData = new FormData();

    // Adaugăm câmpurile de bază
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role);

    // Adaugăm detaliile specifice rolului fără imagine
    if (userData.playerDetails) {
      const { image, ...playerDetailsWithoutImage } = userData.playerDetails;
      formData.append('playerDetails', JSON.stringify(playerDetailsWithoutImage));
      if (image) {
        formData.append('image', image); // Imaginea ca fișier separat
      }
    }
    if (userData.managerDetails) {
      const { image, ...managerDetailsWithoutImage } = userData.managerDetails;
      formData.append('managerDetails', JSON.stringify(managerDetailsWithoutImage));
      if (image) {
        formData.append('image', image); // Imaginea ca fișier separat
      }
    }
    if (userData.staffDetails) {
      const { image, ...staffDetailsWithoutImage } = userData.staffDetails;
      formData.append('staffDetails', JSON.stringify(staffDetailsWithoutImage));
      if (image) {
        formData.append('image', image); // Imaginea ca fișier separat
      }
    }

    console.log('Imagine trimisă:', userData.playerDetails?.image);

    const response = await fetch('http://localhost:5000/api/users/add', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.user;
    } else {
      throw new Error(data.message || 'Eroare la adăugarea utilizatorului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
/*
export const fetchCurrentUser = async (id) => {
 
  const response = await fetch(`http://localhost:5000/api/users/admin/${id}`);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    console.error('Error:', data.message);
    return null;
  }
};*/
export const fetchCurrentUser = async (id, role) => {
  if (!['admin', 'player', 'manager', 'staff'].includes(role)) {
    console.error('Invalid role');
    return null;
  }

  const response = await fetch(`http://localhost:5000/api/users/${role}/${id}`);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    console.error('Error:', data.message);
    return null;
  }
};

export const deleteUser = async (email) => {
  try {
    const response = await fetch('http://localhost:5000/api/users/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      return data.message;
    } else {
      throw new Error(data.message || 'Eroare la ștergerea utilizatorului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
export const editUser = async (userId, userData) => {
  try {
    const formData = new FormData();

    // Adaugăm câmpurile de bază
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (userData.password) formData.append('password', userData.password);
    if (userData.role) formData.append('role', userData.role);

    // Adaugăm detaliile specifice rolului, fără imagine
    if (userData.playerDetails) {
      const { image, ...playerDetailsWithoutImage } = userData.playerDetails;
      formData.append('playerDetails', JSON.stringify(playerDetailsWithoutImage));
      // Adaugăm imaginea doar dacă utilizatorul a încărcat una nouă
      if (image && typeof image !== 'string') {
        formData.append('image', image); // Imaginea nouă, ca fișier
      }
    }
    if (userData.managerDetails) {
      const { image, ...managerDetailsWithoutImage } = userData.managerDetails;
      formData.append('managerDetails', JSON.stringify(managerDetailsWithoutImage));
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }
    }
    if (userData.staffDetails) {
      const { image, ...staffDetailsWithoutImage } = userData.staffDetails;
      formData.append('staffDetails', JSON.stringify(staffDetailsWithoutImage));
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }
    }

    // Logăm datele trimise pentru depanare
    console.log('userData trimis:', userData);
    console.log('Imagine trimisă:', formData.get('image'));

    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      body: formData, // Trimitem FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Eroare la actualizarea utilizatorului');
    }

    return response.json();
  } catch (error) {
    console.error('Eroare la editare:', error);
    throw error;
  }
};
