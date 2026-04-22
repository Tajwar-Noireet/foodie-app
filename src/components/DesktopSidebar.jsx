import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DesktopSidebar.css';

// 1. UNCOMMENTED: Make sure these file names match your actual files exactly!
import logoLight from '../assets/images/logo.png';       
import logoDark from '../assets/images/logo-white.png';  

export default function DesktopSidebar({ toggleTheme, currentTheme }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  const currentPath = location.pathname;

  return (
    <aside className="desktop-sidebar">
      
      {/* 2. FIXED BRANDING: Only one brand section at the top, using the theme check */}
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <img 
          src={currentTheme === 'dark' ? logoDark : logoLight} 
          alt="foodie logo" 
          className="brand-logo-img" 
        />
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
        {/* THE TOGGLE BUTTON */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          style={{
             width: '100%', padding: '12px', marginBottom: '15px', 
             borderRadius: '8px', border: '1px solid var(--border-color)', 
             background: 'transparent', color: 'var(--text-color)',
             cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
          }}
        >
          {currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <Link to="/create" className="create-btn">
          ➕ Create Recipe
        </Link>
      </div>
    </aside>
  );
}