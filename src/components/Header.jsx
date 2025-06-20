import React from 'react';
import {
  BsFillBellFill,
  BsSearch,
  BsJustify,
  BsMoon
} from 'react-icons/bs';
import '../styles/Header.css';

function Header({ OpenSidebar, user }) {
  return (
    <header className="header">
      <div className="header-left">
        <BsJustify className="icon toggle-icon" onClick={OpenSidebar} />
        <h4>Welcome, {user?.firstName || 'User'}</h4>
      </div>

      <div className="header-right">
        {/* Search bar */}
        <div className="search-bar">
          <BsSearch className="search-icon" />
          <input type="text" placeholder="Search here" />
        </div>

        <BsFillBellFill className="icon" />
        <BsMoon className="icon" />

        <div className="user-info">
          <div className="user-avatar">
            {user?.initials || 'NA'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.fullName || 'No Name'}</span>
            <span className="user-email">{user?.email || 'unknown@email.com'}</span>
          </div>
          <div className="dropdown-arrow">▾</div>
        </div>
      </div>
    </header>
  );
}

export default Header;
