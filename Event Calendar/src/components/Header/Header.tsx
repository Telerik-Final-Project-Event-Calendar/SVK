import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import { IHeaderProps } from '../../types/app.types';
import './Header.css';

const Header: React.FC<IHeaderProps> = () => {
  const { user, userData, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => { 
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header>
      <div className="logo">
        <NavLink to="/">
          <img src="/logo.svg" alt="Event Calendar Logo" />
          <h1>Event Calendar</h1>
        </NavLink>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          {user && userData && (
            <>
              <li>
                <NavLink to="/create-event">Create Event</NavLink>
              </li>
              <li>
                <NavLink to="/my-events">My Events</NavLink>
              </li>
              <li>
                <NavLink to="/all-events">All Events</NavLink>
              </li>
            </>
          )}
          {user && userData?.handle && (
            <li>
              <ProfileDropdown
                handle={userData.handle}
                email={userData.email}
                onLogout={handleLogout}
              />
            </li>
          )}
          {!user && (
            <>
              <li>
                <NavLink to="/register">Register</NavLink>
              </li>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;