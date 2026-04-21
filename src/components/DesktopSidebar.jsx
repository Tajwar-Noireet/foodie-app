import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DesktopSidebar.css';

// 1. This import points to the folder you just fixed!
import logoImg from '../assets/images/logo.png';

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // <-- Added this to fix the error
  const currentPath = location.pathname;

  return (
    <aside className="desktop-sidebar">
      {/* 2. UPDATED: Brand area with Logo and Nexa Font */}
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <img src={logoImg} alt="foodie logo" className="brand-logo-img" />
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <Link to="/" className={`sidebar-link ${currentPath === '/' ? 'active' : ''}`}>
          <span className="icon">🏠</span> Home
        </Link>
        
        <Link to="/explore" className={`sidebar-link ${currentPath === '/explore' ? 'active' : ''}`}>
          <span className="icon">🧭</span> Explore
        </Link>

        <Link to="/saved" className={`sidebar-link ${currentPath === '/saved' ? 'active' : ''}`}>
          <span className="icon">🔖</span> Saved Recipes
        </Link>

        <Link to="/profile" className={`sidebar-link ${currentPath === '/profile' ? 'active' : ''}`}>
          <span className="icon">👤</span> Profile
        </Link>
      </nav>

      {/* The big Create action at the bottom */}
      <div className="sidebar-footer">
        <Link to="/create" className="create-btn">
          ➕ Create Recipe
        </Link>
      </div>
    </aside>
  );
}