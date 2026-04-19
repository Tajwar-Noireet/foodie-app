import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DesktopSidebar.css';

export default function DesktopSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="desktop-sidebar">
      {/* App Logo / Title area */}
      <div className="sidebar-brand">
        <h2>ChefGordon</h2>
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