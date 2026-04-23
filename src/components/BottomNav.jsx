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

      {/* 3. Create Recipe (The Big Center Button) */}
      <Link to="/create" className="nav-item create-btn" style={{ textDecoration: 'none' }}>
        <div className="create-icon-wrapper" style={{
          background: 'var(--accent-color, #0095f6)',
          color: 'white',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transform: 'translateY(-15px)', // Pushes it up to "float" above the nav bar
          boxShadow: '0 4px 10px rgba(0, 149, 246, 0.3)'
        }}>
          ➕
        </div>
      </Link>

      {/* 4. My Kitchen (Saved + Shopping List Hub) */}
      <Link to="/kitchen" className={`nav-item ${currentPath === '/kitchen' ? 'active' : ''}`}>
        🍳
      </Link>

      {/* 5. User Profile */}
      <Link to="/profile" className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}>
        👤
      </Link>

    </div>
  );
}