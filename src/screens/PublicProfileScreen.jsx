import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';
import toast from 'react-hot-toast';

export default function PublicProfileScreen({ session }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, recipeCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfileData();
  }, [id, session]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Get Profile Info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      setProfile(profileData);

      // 2. Get Their Published Recipes
      const { data: recipeData } = await supabase
        .from('recipes_with_chefs')
        .select('*')
        .eq('author_id', id)
        .order('created_at', { ascending: false });
        
      setRecipes(recipeData || []);

      // 3. Get Follow Stats (Using Supabase's built-in counter for speed!)
      const { count: followerCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id);
        
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id);
      
      setStats({ 
        followers: followerCount || 0, 
        following: followingCount || 0, 
        recipeCount: recipeData?.length || 0 
      });

      // 4. Check if the current user is following them
      if (session?.user?.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', id)
          .maybeSingle();
          
        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!session?.user?.id) return toast.error("Please log in to follow chefs!");
    if (session.user.id === id) return toast.error("You can't follow yourself!");

    try {
      if (isFollowing) {
        // Unfollow
        await supabase.from('follows').delete()
          .match({ follower_id: session.user.id, following_id: id });
        setIsFollowing(false);
        setStats(s => ({ ...s, followers: s.followers - 1 })); // Instant UI update
        toast.success("Unfollowed");
      } else {
        // Follow
        await supabase.from('follows').insert([
          { follower_id: session.user.id, following_id: id }
        ]);
        setIsFollowing(true);
        setStats(s => ({ ...s, followers: s.followers + 1 })); // Instant UI update
        toast.success("Following!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating follow status.");
    }
  };

  const isOwnProfile = session?.user?.id === id;

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* Profile Header Skeleton (Using your new Pulse animation) */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e0e0e0', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ width: '200px', height: '28px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
             <div style={{ width: '300px', height: '20px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
          </div>
        </div>
        {/* Recipe Grid Skeleton */}
        <div className="recipe-grid">
          {[1, 2, 3].map(n => <div key={n} className="skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Chef not found.</div>;

  return (
    <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', marginBottom: '20px', color: '#8e8e8e', fontWeight: 'bold' }}>
        ← Back
      </button>

      {/* --- TOP PROFILE HEADER --- */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
        
        {/* DYNAMIC AVATAR */}
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.username} 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dbdbdb' }} 
          />
        ) : (
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f8ff', border: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>
            🧑‍🍳
          </div>
        )}

        {/* Info & Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>@{profile.username || 'Unknown Chef'}</h1>
            
            {/* The Buttons moved up here next to the name, just like Instagram! */}
            {!isOwnProfile ? (
              <button 
                onClick={toggleFollow}
                style={{ 
                  padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s',
                  backgroundColor: isFollowing ? '#efefef' : '#0095f6',
                  color: isFollowing ? '#000' : '#fff'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : (
              <button 
                onClick={() => navigate('/edit-profile')} // We will build this next!
                style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid #dbdbdb', background: '#fafafa', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '30px', marginBottom: '15px', fontSize: '16px' }}>
            <div><strong style={{ fontSize: '18px' }}>{stats.recipeCount}</strong> posts</div>
            <div><strong style={{ fontSize: '18px' }}>{stats.followers}</strong> followers</div>
            <div><strong style={{ fontSize: '18px' }}>{stats.following}</strong> following</div>
          </div>

          {/* DYNAMIC BIO */}
          <div style={{ fontSize: '15px', lineHeight: '1.5', maxWidth: '400px' }}>
            {profile.bio ? (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
            ) : (
              <p style={{ margin: 0, color: '#8e8e8e', fontStyle: 'italic' }}>
                {isOwnProfile ? "Write a bio to tell people about your cooking style!" : "This chef hasn't written a bio yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', marginBottom: '30px' }} />

      {/* --- RECIPE GRID --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', borderBottom: '1px solid #dbdbdb', paddingBottom: '10px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '10px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Recipes</span>
      </div>

      <div className="recipe-grid">
        {recipes.length > 0 ? (
          recipes.map((r) => (
            <RecipeCard 
              key={r.id}
              id={r.id}
              title={r.title}
              image={r.image_url}
              chef={r.chef_name} 
              authorId={r.author_id}
            />
          ))
        ) : (
          <p style={{ gridColumn: '1/-1', color: '#8e8e8e', textAlign: 'center', marginTop: '40px', fontSize: '16px' }}>
            This chef hasn't published any recipes yet.
          </p>
        )}
      </div>
    </div>
  );
}