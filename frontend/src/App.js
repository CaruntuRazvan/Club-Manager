import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AdminPage from './pages/AdminPage';
import PlayerPage from './pages/PlayerPage';
import ManagerPage from './pages/ManagerPage';
import StaffPage from './pages/StaffPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Adaugă o stare pentru încărcare

  useEffect(() => {
    // Verifică starea de autentificare la încărcarea paginii
    const storedUser = localStorage.getItem('user');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

    console.log('Stored user:', storedUser); // Debug: Verifică ce este în localStorage
    console.log('Stored isAuthenticated:', storedIsAuthenticated);

    if (storedUser && storedIsAuthenticated === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Eroare la parsarea datelor din localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    }
    setIsLoading(false); // Termină încărcarea după verificare
  }, []);

  useEffect(() => {
    if (userInfo) {
      console.log('userInfo actualizat:', userInfo);
    }
  }, [userInfo]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  // Așteaptă până când starea de autentificare este verificată
  if (isLoading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={<LoginForm setIsAuthenticated={setIsAuthenticated} setUserInfo={setUserInfo} />}
        />
        <Route
          path="/admin/:id"
          element={
            isAuthenticated && userInfo?.role === 'admin' ? (
              <>
                {console.log('userInfo în ruta admin:', userInfo)}
                <AdminPage userId={userInfo.id} handleLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/player/:id"
          element={
            isAuthenticated && userInfo?.role === 'player' ? (
              <PlayerPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/manager/:id"
          element={
            isAuthenticated && userInfo?.role === 'manager' ? (
              <ManagerPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/staff/:id"
          element={
            isAuthenticated && userInfo?.role === 'staff' ? (
              <StaffPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;