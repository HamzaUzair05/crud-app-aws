import React, { useState, useEffect } from 'react';
import { Link, useLocation, withRouter } from 'react-router-dom';
import './Navigation.css';

// Using withRouter higher-order component for location access in older react-router versions
const Navigation = ({ isAuthenticated, onLogout, location }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Remove token from localStorage
    localStorage.removeItem('token');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          CRUD App
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link">
                  Upload Files
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={handleLogout}>
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

// Export with the withRouter HOC
export default withRouter(Navigation);
