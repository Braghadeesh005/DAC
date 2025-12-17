import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const LEFT_ARROW = '>>';
const RIGHT_ARROW = '<<';

const sidebarGroups = {
  apps: [
    { name: 'App Dashboard', to: '/apps/home' },
    { name: 'Manage Groups', to: '/apps/group' },
  ],
  inv: [
    { name: 'Inventory Overview', to: '/inv/home' },
    { name: 'Cage Info', to: '/inv/cage' },
  ],
  fw: [
    { name: 'FireWall Overview', to: '/fw/home' },
    { name: 'Firmware Versions', to: '/fw/versions' },
    { name: 'Update Firmware', to: '/fw/update' },
  ],
  lb: [
    { name: 'LB Overview', to: '/lb/home' },
    { name: 'Load Balancer Stats', to: '/lb/stats' },
    { name: 'Cage Info', to: '/lb/cage' },
  ],
  profile: [
    { name: 'Profile', to: '/profile/home' },
    { name: 'Edit Color Theme', to: '/profile/Editheme' },
    { name: 'Logout', to: '/profile/logout' },
  ],
};

const SideBar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleHover = () => {
    if (!isOpen) {
      setIsOpen(true);
      onToggle(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onToggle(false);
  };

  const currentPrefix = Object.keys(sidebarGroups).find(prefix =>
    location.pathname.startsWith(`/${prefix}`)
  );
  const links = sidebarGroups[currentPrefix] || [];

  return (
    <>
      {!isOpen && (
        <div className="sidebar-toggle-wrapper" onMouseEnter={handleHover}>
          <button className="sidebar-toggle-btn">{LEFT_ARROW}</button>
        </div>
      )}

      <div className={`sidebar ${isOpen ? 'visible' : ''}`}>
        {isOpen && (
          <div className="sidebar-close-container">
            <button className="sidebar-toggle-btn" onClick={handleClose}>
              {RIGHT_ARROW}
            </button>
          </div>
        )}

        <div className="sidebar-nav-list">
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBar;