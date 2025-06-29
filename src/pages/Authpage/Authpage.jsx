import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AuthForm.css';
import { loginUser } from '../../api/auth/auth';

const PMGAuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // To store validation errors
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!username || !password) {
      setError('Please fill in both fields');
      return;
    }

    try {
      const response = await loginUser({ username, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/Home');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #e2e2e2, #c9d6ff)',
      }}
    >
      <div className="pmg-auth-container">
        {/* Login Form */}
        <div className="pmg-form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show error if any */}
            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PMGAuthPage;
