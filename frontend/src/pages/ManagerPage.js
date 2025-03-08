import React, { useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/userService'; // Presupunem că funcția e aceeași

const ManagerPage = ({ userId }) => {
  const [managerInfo, setManagerInfo] = useState(null);
  const role = 'manager'; // Definim rolul pentru a-l trimite la fetchCurrentUser
   useEffect(() => {
    const loadManagerInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const managerData = await fetchCurrentUser(userId, role); 
        console.log('Date manager:', managerData); // Debugging
        setManagerInfo(managerData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor managerului:', error);
      }
    };

    loadManagerInfo();
  }, [userId, role]);

  return (
    <div>
      <h2>Manager Page</h2>

      {managerInfo && (
        <div>
          <h3>Manager Detalii</h3>
          <p><strong>Nume:</strong> {managerInfo.name} {managerInfo.lastName}</p>
          <p><strong>Email:</strong> {managerInfo.email}</p>
          <p><strong>Naționalitate:</strong> {managerInfo.managerId?.nationality}</p>

          <h4>Istoricul Cluburilor</h4>
          {managerInfo.managerId?.history.length > 0 ? (
            <ul>
              {managerInfo.managerId.history.map((entry, index) => (
                <li key={index}>
                  {entry.club} ({entry.startYear} - {entry.endYear})
                </li>
              ))}
            </ul>
          ) : (
            <p>Nu există istoricul cluburilor pentru acest manager.</p>
          )}

          <img
            src={
              managerInfo.managerId?.image
                ? `http://localhost:5000${managerInfo.managerId.image}`
                : ''
            }
            alt="Manager"
            style={{ maxWidth: '200px', display: managerInfo.managerId?.image ? 'block' : 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default ManagerPage;