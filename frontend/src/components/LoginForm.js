import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import '../styles/LoginForm.css';

const LoginForm = ({ setIsAuthenticated, setUserInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Păstrăm starea pentru toggle
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = "/images/logo_background.png";
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.includes('@')) {
      setErrorMessage('Introdu un email valid.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      setErrorMessage(null);
      setLoading(true);
      const data = await loginUser(email, password);
      const { token, user } = data;
      setIsAuthenticated(true);
      setUserInfo(user);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);
      navigate(`/${user.role}/${user.id}`);
    } catch (error) {
      setErrorMessage('Email sau parolă incorectă.');
    } finally {
      setLoading(false);
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
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoFocus
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'} // Comutăm între text și password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ascunde parola' : 'Afișează parola'}
              disabled={loading}
            >
              <span className="eye-icon">👁️‍🗨️</span> {/* Folosim același emoji */}
            </button>
          </div>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;