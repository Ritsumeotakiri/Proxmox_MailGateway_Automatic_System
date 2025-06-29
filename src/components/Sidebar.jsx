import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill,
  BsListCheck, BsMenuButtonWideFill, BsMailbox,
  BsGearFill,
  BsPower,
  BsFilter,
  BsFilterCircleFill,
  BsFilterRight,
  BsPaperclip
} from 'react-icons/bs';
import '../styles/sidebar.css'; 

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const sidebarRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSidebarToggle &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        OpenSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openSidebarToggle, OpenSidebar]);

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      id="sidebar"
      ref={sidebarRef}
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-container">
        {/* Top section */}
        <div>
          <div className='sidebar-title'>
            <div className='sidebar-brand'>
              <BsMailbox className='icon_header' />
            </div>
            {/* This icon is hidden on large screens */}
            <span className='icon close_icon hide-on-desktop' onClick={OpenSidebar}>X</span>
          </div>

          <ul className='sidebar-list'>
            <Link to="/Home" className={`sidebar-list-item ${isActive("/Home") ? "active" : ""}`}>
              <BsGrid1X2Fill className='icon' /> Dashboard
            </Link>
            <Link to="/Quarantine" className={`sidebar-list-item ${isActive("/Quarantine") ? "active" : ""}`}>
              <BsFillArchiveFill className='icon' /> Quarantine Management
            </Link>
            <Link to="/policies" className={`sidebar-list-item ${isActive("/policies") ? "active" : ""}`}>
              <BsFilter className='icon' /> Filtering Rules/Policies
            </Link>    
            <Link to="/BlockAllowList" className={`sidebar-list-item ${isActive("/BlockAllowList") ? "active" : ""}`}>
              <BsPeopleFill className='icon' /> Block/Allow List
            </Link>
          </ul>
        </div>

        {/* Bottom section */}
        <ul className='sidebar-list sidebar-bottom'>
          <Link to="/setting" className={`sidebar-list-item ${isActive("/setting") ? "active" : ""}`}>
            <BsGearFill className='icon' /> Settings
          </Link>
          <Link to="/signup" className="sidebar-list-item" onClick={() => localStorage.removeItem('token')}>
            <BsPower className='icon' /> Logout
          </Link>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
