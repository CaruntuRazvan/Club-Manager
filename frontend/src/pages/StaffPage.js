import React, { useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/userService';

const StaffPage = ({ userId }) => {
  const [staffInfo, setStaffInfo] = useState(null);
  const role = 'staff';
 useEffect(() => {
  const loadStaffInfo = async () => {
    if (!userId || !role) {
      console.error('No userId or role provided!');
      return;
    }

    try {
      const staffData = await fetchCurrentUser(userId, role);
      console.log('Date primite de la fetchCurrentUser:', staffData); // Debug
      setStaffInfo(staffData);
    } catch (error) {
      console.error('Eroare la încărcarea datelor staff:', error);
    }
  };

  loadStaffInfo();
}, [userId, role]); // Dependențe: se va relua dacă userId sau role se schimbă


  return (
    <div>
      <h2>Staff Page</h2>

      {staffInfo ? (
        staffInfo.staffId ? (
          <div>
            <h3>Staff Detalii</h3>
            <p><strong>Nume:</strong> {staffInfo.name} {staffInfo.staffId?.lastName}</p>
            <p><strong>Email:</strong> {staffInfo.email}</p>
            <p><strong>Rol:</strong> {staffInfo.role}</p>
            <p><strong>Naționalitate:</strong> {staffInfo.staffId?.nationality}</p>

            <h4>Istoricul Cluburilor</h4>
            {Array.isArray(staffInfo.staffId.history) && staffInfo.staffId.history.length > 0 ? (
              <ul>
                {staffInfo.staffId.history.map((entry, index) => (
                  <li key={index}>
                    {entry.club} ({entry.startYear} - {entry.endYear})
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nu există istoricul cluburilor pentru acest membru staff.</p>
            )}

            <h4>Certificări</h4>
            {Array.isArray(staffInfo.staffId.certifications) && staffInfo.staffId.certifications.length > 0 ? (
              <ul>
                {staffInfo.staffId.certifications.map((cert, index) => (
                  <li key={index}>
                    {cert.name} ({cert.year})
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nu există certificări pentru acest membru staff.</p>
            )}

            <img
              src={
                staffInfo.staffId?.image
                  ? `http://localhost:5000${staffInfo.staffId.image}`
                  : ''
              }
              alt="Staff"
              style={{ maxWidth: '200px', display: staffInfo.staffId?.image ? 'block' : 'none' }}
            />
          </div>
        ) : (
          <p>Nu există detalii asociate pentru acest membru staff.</p>
        )
      ) : (
        <p>Încărcare date...</p>
      )}
    </div>
  );
};

export default StaffPage;