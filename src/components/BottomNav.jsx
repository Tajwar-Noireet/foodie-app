import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  // This tells us what the current URL is (e.g., '/', '/profile')
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="bottom-nav-container">
      
      {/* 1. Home / Feed */}
      <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>
        🏠
      </Link>

      {/* 2. Explore */}
      <Link to="/explore" className={`nav-item ${currentPath === '/explore' ? 'active' : ''}`}>
        🧭
      </Link>

      {/* 3. Create Recipe (The Add Button) */}
      <Link to="/create" className="nav-item add-btn">
        ➕
      </Link>

      {/* 4. User Profile */}
      <Link to="/profile" className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}>
        👤
      </Link>

      {/* 5. Saved Recipes */}
      <Link to="/saved" className={`nav-item ${currentPath === '/saved' ? 'active' : ''}`}>
        🔖
      </Link>
      
      
    </div>
  );
}