import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

const leftLinks = [
  { name: 'Applications', to: '/apps' },
  { name: 'Inventory', to: '/inv' },
  { name: 'Firewall', to: '/fw' },
  { name: 'LB', to: '/lb' },
];

const rightLinks = [
  { name: 'Admin', to: '/admin' },
  { name: 'Profile', to: '/profile' },
];

const Navbar = () => {
  const location = useLocation();

  const isPathActive = (pathPrefix) => {
    return location.pathname.startsWith(pathPrefix);
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <NavLink to="#" className="dac-link">DAC</NavLink>
        {leftLinks.map(link => (
          <NavLink
            key={link.name}
            to={`${link.to}/home`}
            className={`link ${isPathActive(link.to) ? 'active-link' : ''}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
      <div className="nav-links">
        {rightLinks.map(link => (
          <NavLink
            key={link.name}
            to={`${link.to}/home`}
            className={`link ${isPathActive(link.to) ? 'active-link' : ''}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
