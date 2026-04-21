import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

export default function PublicProfileScreen({ session }) {
  const { id: profileId } = useParams(); // Gets the ID from /user/:id
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [profileId, session]);

 const fetchProfileData = async () => {
    setLoading(true);
    
    try {
      // 1. Get Profile Details
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
        
      if (profileErr) throw profileErr;
      setProfile(profileData);

      // 2. Fetch ONLY the recipes (No Join)
      const { data: recipeData, error: recipeErr } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_id', profileId)
        .order('created_at', { ascending: false });
        
      if (recipeErr) throw recipeErr;

      // 3. Stitch the username directly onto the recipe data
      const stitchedRecipes = recipeData.map(recipe => ({
        ...recipe,
        profiles: { username: profileData.username }
      }));

      setRecipes(stitchedRecipes);

      // 4. Check follow status
      if (session?.user?.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id)
          .eq('following_id', profileId)
          .maybeSingle();
        
        setIsFollowing(!!followData);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    // Graceful check for logged-out users
    if (!session?.user?.id) {
      alert("Please log in to follow this chef!");
      return; 
    }

    try {
      if (isFollowing) {
        // Silent Unfollow
        const { error } = await supabase.from('follows').delete()
          .match({ follower_id: session.user.id, following_id: profileId });
        
        if (error) throw error;
        setIsFollowing(false);

      } else {
        // Silent Follow
        const { error } = await supabase.from('follows').insert([
          { follower_id: session.user.id, following_id: profileId }
        ]);
        
        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow Error:", err);
      // Only alert if something actually breaks
      alert("Something went wrong updating your follow status."); 
    }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading Chef...</p>;
  if (!profile) return <p style={{textAlign: 'center', marginTop: '50px'}}>Chef not found!</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>{profile.username}'s Kitchen</h1>
        
        {/* Hide follow button if viewing your own profile */}
        {session?.user?.id !== profileId && (
          <button 
            onClick={toggleFollow}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: isFollowing ? '#efefef' : '#0095f6',
              color: isFollowing ? '#262626' : 'white'
            }}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {recipes.length > 0 ? (
          recipes.map(r => (
            <RecipeCard 
              key={r.id} 
              id={r.id} 
              title={r.title} 
              image={r.image_url} 
              chef={profile.username} 
              authorId={profileId} 
            />
          ))
        ) : (
          <p>This chef hasn't posted any recipes yet.</p>
        )}
      </div>
    </div>
  );
}