import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';
import { useLocation } from 'react-router-dom';

export default function FeedScreen({ session }) {
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchRecipes();
  }, [activeTab, location.pathname, session]);

  const fetchRecipes = async () => {
    setLoading(true);
    setRecipes([]);

    try {
      if (activeTab === 'following') {
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        // 1. Get who you follow
        const { data: follows, error: followErr } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id);

        if (followErr) console.error("Follows Fetch Error:", followErr);

        const followingIds = follows?.map(f => f.following_id) || [];

        if (followingIds.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }

        // 2. Query the NEW VIEW instead of the recipes table
        const { data, error } = await supabase
          .from('recipes_with_chefs')
          .select('*')
          .in('author_id', followingIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);

      } else {
        // EXPLORE TAB
        const { data, error } = await supabase
          .from('recipes_with_chefs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      }
    } catch (err) {
      console.error("View Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '30px', padding: '20px', borderBottom: '1px solid var(--border-color)', transition: 'border-color 0.3s ease' }}>
        <button 
          onClick={() => setActiveTab('explore')}
          style={{ 
            fontWeight: activeTab === 'explore' ? 'bold' : 'normal', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer', 
            fontSize: '16px',
            color: 'var(--text-color)', /* THE FIX: Forces button to use theme text */
            opacity: activeTab === 'explore' ? 1 : 0.5, /* THE PRO TOUCH: Fades the inactive tab */
            transition: 'color 0.3s ease, opacity 0.2s ease'
          }}
        >
          EXPLORE
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          style={{ 
            fontWeight: activeTab === 'following' ? 'bold' : 'normal', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer', 
            fontSize: '16px',
            color: 'var(--text-color)', /* THE FIX: Forces button to use theme text */
            opacity: activeTab === 'following' ? 1 : 0.5, /* THE PRO TOUCH: Fades the inactive tab */
            transition: 'color 0.3s ease, opacity 0.2s ease'
          }}
        >
          FOLLOWING
        </button>
      </nav>

      {/* SKELETON LOADER */}
      {loading ? (
        <div className="recipe-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card"></div>
          ))}
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <RecipeCard 
                key={r.id}
                id={r.id}
                title={r.title}
                image={r.image_url}
                chef={r.chef_name || "Unknown Chef"} 
                authorId={r.author_id}
              />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '50px', color: '#8e8e8e' }}>
              {activeTab === 'following' 
                ? (session ? "You aren't following anyone yet!" : "Log in to see your following feed!") 
                : "No recipes found."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}