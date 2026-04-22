import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RecipeCard({ id, title, image, chef, authorId, rating }) {
  const navigate = useNavigate();

  return (
    <div 
      className="recipe-card" 
      onClick={() => navigate(`/recipe/${id}`)}
      style={{
        background: 'var(--bg-color, #fff)', /* Pro-tip: Added CSS variable fallback for your dark mode! */
        borderRadius: '12px',
        border: '1px solid var(--border-color, #efefef)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}
    >
      {/* --- IMAGE WRAPPER (Added position: relative) --- */}
      <div style={{ width: '100%', height: '200px', position: 'relative' }}>
        
        <img 
          src={image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* --- NEW: THE FLOATING RATING BADGE --- */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {/* Shows 1 decimal place (e.g., 4.5) or 'New' if no reviews exist */}
          ⭐ {rating > 0 ? Number(rating).toFixed(1) : 'New'}
        </div>

      </div>

      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-color, #262626)' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: '#8e8e8e', margin: 0 }}>
          By <Link 
               to={`/user/${authorId}`} 
               style={{ color: 'var(--accent-color, #0095f6)', textDecoration: 'none', fontWeight: '600' }}
               onClick={(e) => e.stopPropagation()} // Prevents card click when clicking name
             >
               {chef || "Unknown Chef"}
             </Link>
        </p>
      </div>
    </div>
  );
}