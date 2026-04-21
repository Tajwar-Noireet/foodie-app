import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

export default function ProfileScreen({ session }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, recipeCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) fetchMyData();
  }, [session]);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const myId = session.user.id;

      // 1. Get My Profile Info (Bio, Avatar, etc.)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', myId)
        .single();
      setProfile(profileData);

      // 2. Get My Recipes
      const { data: recipeData } = await supabase
        .from('recipes_with_chefs')
        .select('*')
        .eq('author_id', myId)
        .order('created_at', { ascending: false });
      setMyRecipes(recipeData || []);

      // 3. Get Follower/Following Counts
      const { count: followerCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', myId);
        
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', myId);

      setStats({
        followers: followerCount || 0,
        following: followingCount || 0,
        recipeCount: recipeData?.length || 0
      });

    } catch (error) {
      console.error("Error fetching my profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e0e0e0', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ width: '200px', height: '28px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
          </div>
        </div>
        <div className="recipe-grid">
          {[1, 2, 3].map(n => <div key={n} className="skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* --- TOP PROFILE HEADER (INSTAGRAM STYLE) --- */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        
        {/* Avatar */}
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="My Avatar" 
            style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dbdbdb' }} 
          />
        ) : (
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: '#f0f8ff', border: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>
            🧑‍🍳
          </div>
        )}

        {/* Info & Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>@{profile?.username || 'chef'}</h1>
            <button 
              onClick={() => navigate('/edit-profile')} 
              style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid #dbdbdb', background: '#fafafa', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Edit Profile
            </button>
          </div>
          
          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px', fontSize: '16px' }}>
            <div><strong style={{ fontSize: '18px' }}>{stats.recipeCount}</strong> recipes</div>
            <div><strong style={{ fontSize: '18px' }}>{stats.followers}</strong> followers</div>
            <div><strong style={{ fontSize: '18px' }}>{stats.following}</strong> following</div>
          </div>

          {/* Bio */}
          <div style={{ fontSize: '15px', lineHeight: '1.5', maxWidth: '500px' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{profile?.bio || "You haven't written a bio yet. Tap 'Edit Profile' to tell us about your kitchen!"}</p>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', marginBottom: '30px' }} />

      {/* --- MY RECIPES GRID --- */}
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #dbdbdb', paddingBottom: '10px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '10px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
          My Recipes
        </span>
      </div>

      <div className="recipe-grid">
        {myRecipes.length > 0 ? (
          myRecipes.map((r) => (
            <RecipeCard 
              key={r.id}
              id={r.id}
              title={r.title}
              image={r.image_url}
              chef={profile?.username} 
              authorId={session.user.id}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#8e8e8e', fontSize: '18px' }}>You haven't posted any recipes yet.</p>
            <button 
              onClick={() => navigate('/create')}
              style={{ color: '#0095f6', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
            >
              Share your first recipe!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}