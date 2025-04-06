import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import '../styles/LoginForm.css';

const LoginForm = ({ setIsAuthenticated, setUserInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = "/images/logo_background.png";
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password); // Așteaptă răspunsul complet
      const { token, user } = data; // Extrage token și user din obiectul data
      setIsAuthenticated(true);
      setUserInfo(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token); // Stocăm token-ul în localStorage
      console.log('Token stocat:', token); // Debug pentru a verifica token-ul
      if (user.role === 'admin') navigate(`/admin/${user.id}`);
      else if (user.role === 'player') navigate(`/player/${user.id}`);
      else if (user.role === 'manager') navigate(`/manager/${user.id}`);
      else if (user.role === 'staff') navigate(`/staff/${user.id}`);
    } catch (error) {
      console.error('Login error:', error.message);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {!imageLoaded ? (
          <div className="image-placeholder">Loading...</div>
        ) : (
          <img src="/images/logo_background.png" alt="Team Logo" className="team-logo-login" />
        )}
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;