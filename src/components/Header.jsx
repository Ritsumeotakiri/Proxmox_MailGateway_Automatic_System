import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsFillBellFill,
  BsSearch,
  BsJustify,
  BsMoon
} from 'react-icons/bs';
import '../styles/Header.css';

function Header({ OpenSidebar, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const navigate = useNavigate();

  // Mapping search items to actual routes
  const routeMap = {
    dashboard: '/Home',
    quarantine: '/Quarantine',
    rules: '/policies',
    policies: '/policies',
    'block allow list': '/BlockAllowList',
    settings: '/setting',
    profile: '/setting', // Adjust if profile has a different route
  };

  // Handle selecting a search result
  const handleSelect = (item) => {
    const path = routeMap[item.toLowerCase()];
    if (path) {
      navigate(path);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  // Apply theme on mount or theme change
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Handle search filtering
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

  return (
    <header className="header">
      <div className="header-left">
        <BsJustify className="icon toggle-icon hide-on-desktop" onClick={OpenSidebar} />
        <h4>Welcome, {user?.firstName || 'User'}</h4>
      </div>

      <div className="header-right">
        {/* Search bar */}
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

          {/* Dropdown List */}
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

        <BsFillBellFill className="icon" />
        <BsMoon className="icon" onClick={toggleTheme} />

        <div className="user-info">
          <div className="user-avatar">{user?.initials || 'NA'}</div>
          <div className="user-details">
            <span className="user-name">{user?.fullName || 'No Name'}</span>
            <span className="user-email">{user?.email || 'unknown@email.com'}</span>
          </div>
          <div className="dropdown-arrow">▾</div>

          {/* Dropdown Menu */}
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
