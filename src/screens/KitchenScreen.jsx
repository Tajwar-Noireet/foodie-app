import React, { useState } from 'react';
import SavedScreen from './SavedScreen'; // Assuming this is your existing saved recipes file
import ShoppingListScreen from './ShoppingListScreen';

const KitchenScreen = ({ session }) => {
  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'list'

  return (
    <div className="kitchen-container" style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. THE TABBED HEADER */}
      <div className="kitchen-header" style={{ padding: '20px 20px 10px 20px', position: 'sticky', top: '65px', background: 'var(--bg-color)', zIndex: 10 }}>
        <h1 className="feed-title" style={{ margin: '0 0 15px 0' }}>My Kitchen</h1>
        
        {/* iOS-Style Segmented Control Tabs */}
        <div className="tab-container" style={{ 
          display: 'flex', 
          background: 'var(--hover-bg, #f0f0f0)', 
          borderRadius: '12px', 
          padding: '4px' 
        }}>
          <button 
            onClick={() => setActiveTab('saved')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeTab === 'saved' ? 'var(--bg-color, #fff)' : 'transparent',
              color: activeTab === 'saved' ? 'var(--text-color, #000)' : 'var(--text-muted, #888)',
              boxShadow: activeTab === 'saved' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            ❤️ Saved
          </button>
          
          <button 
            onClick={() => setActiveTab('list')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeTab === 'list' ? 'var(--bg-color, #fff)' : 'transparent',
              color: activeTab === 'list' ? 'var(--text-color, #000)' : 'var(--text-muted, #888)',
              boxShadow: activeTab === 'list' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🛒 Shopping List
          </button>
        </div>
      </div>

      {/* 2. THE DYNAMIC CONTENT */}
      <div className="kitchen-content" style={{ paddingBottom: '80px' }}>
        {/* Conditionally render the correct screen based on the active tab */}
        {activeTab === 'saved' ? (
          <SavedScreen session={session} />
        ) : (
          <ShoppingListScreen />
        )}
      </div>

    </div>
  );
};

export default KitchenScreen;