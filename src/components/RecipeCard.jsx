import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RecipeCard({ id, title, image, chef, authorId }) {
  const navigate = useNavigate();

  return (
    <div 
      className="recipe-card" 
      onClick={() => navigate(`/recipe/${id}`)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #efefef',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ width: '100%', height: '200px' }}>
        <img 
          src={image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#262626' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: '#8e8e8e', margin: 0 }}>
          By <Link 
               to={`/user/${authorId}`} 
               style={{ color: '#0095f6', textDecoration: 'none', fontWeight: '600' }}
               onClick={(e) => e.stopPropagation()} // Prevents card click when clicking name
             >
               {chef || "Unknown Chef"}
             </Link>
        </p>
      </div>
    </div>
  );
}