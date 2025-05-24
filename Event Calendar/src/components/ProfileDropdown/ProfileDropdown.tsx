import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IProfileDropdownProps } from '../../types/app.types';
import './ProfileDropdown.css'; 

const ProfileDropdown: React.FC<IProfileDropdownProps> = ({ handle, email, onLogout, avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    onLogout();
    closeDropdown();
  };

  return (
    <div className="profile-dropdown" onMouseLeave={closeDropdown}>
      <div className="profile-toggle" onClick={toggleDropdown}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="User Avatar" className="profile-avatar" />
        ) : (
          <span className="profile-initials">
            {handle.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="profile-handle">{handle}</span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <NavLink to="/profile" className="dropdown-item" onClick={closeDropdown}>
            Profile
          </NavLink>
          <div className="dropdown-item" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;