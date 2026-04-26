import React from 'react';
import toast from 'react-hot-toast';

export default function ShareButton({ title, text, url }) {
  
  const handleShare = async () => {
    
    const shareData = {
      title: title || 'RecipeApp',
      text: text || 'Check out this amazing recipe! 🍳',
      url: url || window.location.href, 
    };

    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  return (
    <button 
      onClick={handleShare}
      style={{
        padding: '10px 20px',
        background: 'var(--hover-bg, #f0f8ff)',
        color: 'var(--accent-color, #0095f6)',
        border: '1px solid var(--accent-color, #0095f6)',
        borderRadius: '25px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '15px',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => { e.target.style.background = 'var(--accent-color)'; e.target.style.color = '#fff'; }}
      onMouseLeave={(e) => { e.target.style.background = 'var(--hover-bg, #f0f8ff)'; e.target.style.color = 'var(--accent-color, #0095f6)'; }}
    >
      <span style={{ fontSize: '18px' }}>⤴️</span> Share
    </button>
  );
}