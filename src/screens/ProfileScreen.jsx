import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProfileScreen = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [myRecipes, setMyRecipes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // The social stats
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      getProfileAndRecipes();
    }
  }, [session]);

 const getProfileAndRecipes = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Profile Name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profileData) setUsername(profileData.username || '');

      // 2. Fetch User's Recipes
      const { data: recipeData } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_id', session.user.id)
        .order('created_at', { ascending: false });

      if (recipeData) setMyRecipes(recipeData);

      // 3. NEW: Count how many people follow THIS user
      // { count: 'exact', head: true } asks Supabase just for the number, not the actual data!
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', session.user.id);
        
      setFollowersCount(followers || 0);

      // 4. NEW: Count how many people THIS user is following
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', session.user.id);

      setFollowingCount(following || 0);

    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        username: username
      });
      if (error) throw error;
      toast.success('Profile updated! 👨‍🍳');
      setIsEditing(false); // Hide form after saving
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <div className="profile-container">
      {/* HEADER: Username and Logout */}
      <div className="profile-top-bar">
        <h2 className="profile-handle">{username || session?.user?.email}</h2>
        <button className="logout-icon-btn" onClick={handleLogout}>🚪</button>
      </div>

      {/* IG STATS SECTION */}
      <div className="ig-header">
        <div className="ig-avatar">👨‍🍳</div>
        <div className="ig-stats">
          <div className="ig-stat">
            <span className="ig-stat-num">{myRecipes.length}</span>
            <span className="ig-stat-label">Recipes</span>
          </div>
          <div className="ig-stat">
            {/* NEW: Use the real follower count */}
            <span className="ig-stat-num">{followersCount}</span>
            <span className="ig-stat-label">Followers</span>
          </div>
          <div className="ig-stat">
            {/* NEW: Use the real following count */}
            <span className="ig-stat-num">{followingCount}</span>
            <span className="ig-stat-label">Following</span>
          </div>
        </div>
      </div>

      {/* IG BIO SECTION */}
      <div className="ig-bio">
        <h3 className="ig-name">{username || "New Chef"}</h3>
        <p className="ig-email">{session?.user?.email}</p>
      </div>

      {/* EDIT BUTTON / FORM TOGGLE */}
      {!isEditing ? (
        <button className="ig-btn" onClick={() => setIsEditing(true)}>
          Edit Profile
        </button>
      ) : (
        <form className="ig-edit-form" onSubmit={updateProfile}>
          <input 
            type="text" 
            placeholder="Your Chef Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div style={{display: 'flex', gap: '10px'}}>
            <button type="submit" className="ig-btn primary" disabled={loading}>Save</button>
            <button type="button" className="ig-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      <hr className="ig-divider" />

      {/* IG PHOTO GRID */}
      <div className="ig-grid">
        {myRecipes.map((recipe) => (
          <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="ig-grid-item">
            <img src={recipe.image_url || 'https://via.placeholder.com/150'} alt={recipe.title} />
          </Link>
        ))}
      </div>
      
      {myRecipes.length === 0 && !loading && (
        <p style={{textAlign: 'center', marginTop: '40px', color: '#71717a'}}>No recipes yet. Time to get cooking!</p>
      )}
    </div>
  );
};

export default ProfileScreen;