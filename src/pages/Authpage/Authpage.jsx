import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AuthForm.css';
import { loginUser, registerUser } from '../../api/auth/auth';


const PMGAuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await loginUser({ username, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/Home'); 
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await registerUser({ username, email, password });
      if (response.success) {
        alert('Registration successful! You can now log in.');
        setIsRegister(false); // ✅ Switch to login form
      } else {
        alert(response.message || 'Registration failed');
        
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
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
      <div className={`pmg-auth-container ${isRegister ? 'active' : ''}`}>
        {/* Login Form */}
        <div className="pmg-form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input name="username" type="text" placeholder="Username" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input name="password" type="password" placeholder="Password" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="social-icons">
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="pmg-form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>
            <div className="input-box">
              <input name="username" type="text" placeholder="Username" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input name="email" type="email" placeholder="Email" required />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="input-box">
              <input name="password" type="password" placeholder="Password" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className="btn">Register</button>

            <div className="social-icons">
            </div>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className="pmg-toggle-box">
          <div className="pmg-toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button className="btn" onClick={() => setIsRegister(true)}>Register</button>
          </div>

          <div className="pmg-toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button className="btn" onClick={() => setIsRegister(false)}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMGAuthPage;
