import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  BsFillBellFill,
  BsSearch,
  BsJustify,
  BsMoon
} from 'react-icons/bs';
import '../styles/Header.css';

const socket = io();

function Header({ OpenSidebar, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsRef = useRef(null);

  const navigate = useNavigate();

  const routeMap = {
    dashboard: '/Home',
    quarantine: '/Quarantine',
    rules: '/policies',
    policies: '/policies',
    'block allow list': '/BlockAllowList',
    settings: '/setting',
    profile: '/setting',
  };

  const handleSelect = (item) => {
    const path = routeMap[item.toLowerCase()];
    if (path) {
      navigate(path);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const mockData = ['Dashboard', 'Quarantine', 'Policies', 'Block Allow List', 'Settings', 'rules'];
    const results = mockData.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signup';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSettings = () => {
    navigate('/setting');
  };

  const toggleAlerts = () => {
    setShowAlerts(prev => !prev);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  useEffect(() => {
    socket.on('mailAlert', (data) => {
      let simpleMessage = "Spam detected";
      if (data.message && data.message.toLowerCase().includes("quarantine")) {
        simpleMessage = "New spam email quarantined";
      } else if (data.message && data.message.toLowerCase().includes("from=<spammer")) {
        simpleMessage = "Spam email detected";
      }

      const alertObj = {
        message: simpleMessage,
        time: data.time || new Date().toISOString()
      };

      setAlerts(prev => [alertObj, ...prev]);
    });

    return () => {
      socket.off('mailAlert');
    };
  }, []);

  // Close alerts dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onAlertClick = (index) => {
    setAlerts(prev => {
      const newAlerts = [...prev];
      newAlerts.splice(index, 1);
      return newAlerts;
    });
    setShowAlerts(false);
    navigate('/Quarantine');
  };

  return (
    <header className="header">
      <div className="header-left">
        <BsJustify className="icon toggle-icon hide-on-desktop" onClick={OpenSidebar} />
        <h4>Welcome, {user?.firstName || 'User'}</h4>
      </div>

      <div className="header-right">
        <div className="search-bar-container">
          <div className="search-bar">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <ul className="search-dropdown">
              {searchResults.map((item, index) => (
                <li
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="notification-wrapper" style={{ position: 'relative' }} ref={alertsRef}>
          <BsFillBellFill className="icon" onClick={toggleAlerts} />
          {alerts.length > 0 && (
            <span className="notification-count" style={{
              position: 'absolute',
              top: -4,
              right: -6,
              backgroundColor: 'red',
              borderRadius: '50%',
              color: 'white',
              fontSize: '12px',
              padding: '2px 6px'
            }}>
              {alerts.length}
            </span>
          )}

          {showAlerts && (
            <div className="alerts-dropdown" style={{
              position: 'absolute',
              top: '30px',
              right: 0,
              width: '300px',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              padding: '10px',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>Mail Alerts</strong>
                <button onClick={clearAlerts} style={{ cursor: 'pointer', fontSize: '12px' }}>Clear</button>
              </div>
              {alerts.length === 0 ? (
                <p>No new alerts</p>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    onClick={() => onAlertClick(idx)}
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '5px 0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{alert.message}</div>
                    <small>{new Date(alert.time).toLocaleTimeString()}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        

        <div className="user-info">
          <div className="user-avatar">{user?.initials || 'NA'}</div>
          <div className="user-details">
            <span className="user-name">{user?.fullName || 'No Name'}</span>
            <span className="user-email">{user?.email || 'unknown@email.com'}</span>
          </div>
          <div className="dropdown-arrow">▾</div>

          <div className="dropdown-menu">
            <button>Profile</button>
            <button onClick={handleSettings}>Settings</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
