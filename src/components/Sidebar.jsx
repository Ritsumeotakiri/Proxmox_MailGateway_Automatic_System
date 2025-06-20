import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill,
  BsListCheck, BsMenuButtonWideFill, BsMailbox
} from 'react-icons/bs';

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSidebarToggle &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        OpenSidebar(); // Close sidebar if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openSidebarToggle, OpenSidebar]);

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
            <span className='icon close_icon' onClick={OpenSidebar}>X</span>
          </div>

          <ul className='sidebar-list'>
            <Link to="/Home" className="sidebar-list-item">
              <BsGrid1X2Fill className='icon' /> Dashboard
            </Link>
            <Link to="/Quarantine" className="sidebar-list-item">
              <BsFillArchiveFill className='icon' /> Quarantine Management
            </Link>
            <Link to="/policies" className="sidebar-list-item">
              <BsFillGrid3X3GapFill className='icon' /> Filtering Rules/Policies
            </Link>
            <Link to="/BlockAllowList" className="sidebar-list-item">
              <BsPeopleFill className='icon' /> Block/Allow List
            </Link>
          </ul>
        </div>

        {/* Bottom section */}
        <ul className='sidebar-list sidebar-bottom'>
          <Link to="/support" className="sidebar-list-item">
            <BsListCheck className='icon' /> Support
          </Link>
          <Link to="/setting" className="sidebar-list-item">
            <BsMenuButtonWideFill className='icon' /> Settings
          </Link>
          <Link to="/signup" className="sidebar-list-item" onClick={() => localStorage.removeItem('token')}>
            <BsMenuButtonWideFill className='icon' /> Logout
          </Link>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
