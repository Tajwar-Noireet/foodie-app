import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

export default function ProfileScreen({ session, toggleTheme, currentTheme }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, recipeCount: 0 });
  const [loading, setLoading] = useState(true);

  // States for our popups
  const [followModal, setFollowModal] = useState({ isOpen: false, type: '', data: [], loading: false });
  
  //  State for our custom Confirm Dialog ---
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', targetUserId: null, actionType: null });

  useEffect(() => {
    if (session?.user?.id) fetchMyData();
  }, [session]);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const myId = session.user.id;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', myId).single();
      setProfile(profileData);

      const { data: recipeData } = await supabase.from('recipes_with_chefs').select('*').eq('author_id', myId).order('created_at', { ascending: false });
      setMyRecipes(recipeData || []);

      const { count: followerCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', myId);
      const { count: followingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', myId);

      setStats({ followers: followerCount || 0, following: followingCount || 0, recipeCount: recipeData?.length || 0 });
    } catch (error) {
      console.error("Error fetching my profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const openFollowModal = async (type) => {
    setFollowModal({ isOpen: true, type, data: [], loading: true });
    try {
      let userIds = [];
      const myId = session.user.id;

      if (type === 'followers') {
        const { data } = await supabase.from('follows').select('follower_id').eq('following_id', myId);
        userIds = data?.map(d => d.follower_id) || [];
      } else {
        const { data } = await supabase.from('follows').select('following_id').eq('follower_id', myId);
        userIds = data?.map(d => d.following_id) || [];
      }

      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url').in('id', userIds);
        setFollowModal({ isOpen: true, type, data: profiles || [], loading: false });
      } else {
        setFollowModal({ isOpen: true, type, data: [], loading: false });
      }
    } catch (error) {
      console.error("Error fetching follow data:", error);
      setFollowModal(prev => ({ ...prev, loading: false }));
    }
  };

  //  Step 1: Open the Custom Confirm Dialog ---
  const promptSocialAction = (targetUserId, actionType, e) => {
    e.stopPropagation(); // Don't click through to their profile!
    const message = actionType === 'unfollow' 
      ? "Are you sure you want to unfollow this chef?" 
      : "Remove this user from your followers?";
      
    setConfirmDialog({ isOpen: true, message, targetUserId, actionType });
  };

  //  Step 2: Actually execute the delete if they say Yes ---
  const executeSocialAction = async () => {
    const { targetUserId, actionType } = confirmDialog;
    const myId = session.user.id;

    try {
      if (actionType === 'unfollow') {
        await supabase.from('follows').delete().match({ follower_id: myId, following_id: targetUserId });
        setStats(prev => ({ ...prev, following: prev.following - 1 }));
      } else {
        await supabase.from('follows').delete().match({ follower_id: targetUserId, following_id: myId });
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      }

      setFollowModal(prev => ({ ...prev, data: prev.data.filter(user => user.id !== targetUserId) }));
      setConfirmDialog({ isOpen: false, message: '', targetUserId: null, actionType: null }); // Close the dialog
    } catch (error) {
      console.error("Error updating social status:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    // You can apply this same custom modal logic to deleting recipes later if you want!
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
      if (error) throw error;
      setMyRecipes(prev => prev.filter(r => r.id !== recipeId));
      setStats(prev => ({ ...prev, recipeCount: prev.recipeCount - 1 }));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', position: 'relative' }}>
      
      {/* --- TOP PROFILE HEADER --- */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="My Avatar" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
        ) : (
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'var(--hover-bg)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>🧑‍🍳</div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>@{profile?.username || 'chef'}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/edit-profile')} style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Edit Profile</button>
              <button onClick={toggleTheme} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }}>{currentTheme === 'light' ? '🌙' : '☀️'}</button>
              <button onClick={handleLogout} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Log Out</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px', fontSize: '16px' }}>
            <div><strong style={{ fontSize: '18px' }}>{stats.recipeCount}</strong> recipes</div>
            <div onClick={() => openFollowModal('followers')} style={{ cursor: 'pointer' }}><strong style={{ fontSize: '18px' }}>{stats.followers}</strong> followers</div>
            <div onClick={() => openFollowModal('following')} style={{ cursor: 'pointer' }}><strong style={{ fontSize: '18px' }}>{stats.following}</strong> following</div>
          </div>

          <div style={{ fontSize: '15px', lineHeight: '1.5', maxWidth: '500px' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{profile?.bio || "You haven't written a bio yet. Tap 'Edit Profile' to tell us about your kitchen!"}</p>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '30px' }} />

      {/* --- MY RECIPES GRID --- */}
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold', borderBottom: '2px solid var(--text-color)', paddingBottom: '10px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>My Recipes</span>
      </div>

      <div className="recipe-grid">
        {myRecipes.length > 0 ? (
          myRecipes.map((r) => (
            <div key={r.id} style={{ position: 'relative' }}>
              <RecipeCard id={r.id} title={r.title} image={r.image_url} chef={profile?.username} authorId={session.user.id} />
              <button onClick={() => handleDeleteRecipe(r.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', transition: 'transform 0.2s ease', zIndex: 10 }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="Delete Recipe">
                🗑️
              </button>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
            <p style={{ color: 'var(--text-color)', opacity: 0.6, fontSize: '18px' }}>You haven't posted any recipes yet.</p>
          </div>
        )}
      </div>

      {/* --- THE FOLLOWERS/FOLLOWING MODAL --- */}
      {followModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-color)', width: '400px', maxWidth: '90%', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{followModal.type}</h3>
              <button onClick={() => setFollowModal({ isOpen: false, type: '', data: [], loading: false })} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-color)' }}>✕</button>
            </div>

            <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
              {followModal.loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color)' }}>Loading...</div>
              ) : followModal.data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>No {followModal.type} yet.</div>
              ) : (
                followModal.data.map((user) => (
                  <div key={user.id} onClick={() => { setFollowModal({ isOpen: false, type: '', data: [], loading: false }); navigate(`/user/${user.id}`); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {user.avatar_url ? <img src={user.avatar_url} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🧑‍🍳</div>}
                      <span style={{ fontWeight: 'bold' }}>@{user.username}</span>
                    </div>

                    {/* --- THE NEW BUTTON TRIGGER --- */}
                    <button
                      onClick={(e) => promptSocialAction(user.id, followModal.type === 'followers' ? 'remove' : 'unfollow', e)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'background 0.2s, color 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#ef4444'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                      {followModal.type === 'followers' ? 'Remove' : 'Unfollow'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---  THE CUSTOM CONFIRMATION DIALOG --- */}
      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 /* Higher than the follow list! */ }}>
          <div style={{ background: 'var(--bg-color)', width: '300px', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-color)' }}>Are you sure?</h3>
            <p style={{ color: 'var(--text-color)', opacity: 0.8, marginBottom: '24px' }}>{confirmDialog.message}</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, message: '', targetUserId: null, actionType: null })}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={executeSocialAction}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Yes, {confirmDialog.actionType === 'unfollow' ? 'Unfollow' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}