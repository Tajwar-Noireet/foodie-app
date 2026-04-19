// 1. Make sure THESE two are inside the curly braces from 'react'
import { useState, useEffect } from 'react'; 

import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AuthScreen from './AuthScreen';
import RecipeCard from './components/RecipeCard';
import DesktopSidebar from './components/DesktopSidebar';
import BottomNav from './components/BottomNav';
import './App.css';

// ... the rest of your code
const FeedScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    // Fetching from your 'recipes' table
    const { data, error } = await supabase
      .from('recipes') 
      .select(`
        *,
        author:author_id ( id ) 
      `) // This prepares us to link to user profiles later
      .order('created_at', { ascending: false });

    if (error) console.error('Error:', error);
    else setRecipes(data);
    setLoading(false);
  }

  return (
    <div className="feed-container">
      <h1 className="feed-title">Your Feed</h1>
      {/* ... Search & Filters go here ... */}

      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard 
            key={r.id} 
            id={r.id} // Passing ID for the Save feature
            title={r.title} 
            image={r.image_url} 
            description={r.description}
            // You can add logic here to fetch the author's name later
            chef="ChefGordon" 
          />
        ))}
      </div>
    </div>
  );
};

const ExploreScreen = () => <div style={{padding: '40px'}}>Explore Screen Placeholder</div>;

const CreateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    video_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to share a recipe!");
      setLoading(false);
      return;
    }

    // 2. Insert into your 'recipes' table
    const { error } = await supabase
      .from('recipes')
      .insert([
        { 
          ...formData, 
          author_id: user.id // Matches your RLS requirement
        }
      ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Recipe published! 🍳");
      setFormData({ title: '', description: '', image_url: '', video_url: '' });
    }
    setLoading(false);
  };

  return (
    <div className="create-container">
      <h1 className="feed-title">Create New Recipe</h1>
      
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Recipe Title</label>
          <input 
            type="text" 
            placeholder="e.g. Classic Beef Wellington" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required 
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea 
            placeholder="Tell us about this recipe..." 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>Image URL</label>
          <input 
            type="url" 
            placeholder="https://images.unsplash.com/..." 
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>Video URL (Optional)</label>
          <input 
            type="url" 
            placeholder="YouTube or Vimeo link" 
            value={formData.video_url}
            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Recipe'}
        </button>
      </form>
    </div>
  );
};


const ProfileScreen = () => <div style={{padding: '40px'}}>User Profile (Screen 4)</div>;
const SavedScreen = () => {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          recipe:recipes (
            id,
            title,
            image_url,
            description
          )
        `)
        .eq('user_id', user.id);

      if (data) setSavedItems(data.map(item => item.recipe));
    };
    fetchSaved();
  }, []);

  return (
    <div className="feed-container">
      <h1 className="feed-title">Saved Recipes</h1>
      <div className="recipe-grid">
        {savedItems.map(r => (
          <RecipeCard key={r.id} id={r.id} title={r.title} image={r.image_url} chef="Saved" />
        ))}
      </div>
    </div>
  );
};



function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check for current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout Function (Your original CSS had a logout button!)
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // IF NOT LOGGED IN: Show Auth
  if (!session) {
    return <AuthScreen />;
  }

  // IF LOGGED IN: Show the App
  return (
    <div className="app-layout">
      {/* You can pass handleLogout to your sidebar or header here */}
      <DesktopSidebar onLogout={handleLogout} /> 
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<FeedScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/create" element={<CreateScreen />} />
          <Route path="/saved" element={<SavedScreen />} />
          <Route path="/profile" element={<ProfileScreen session={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
}
export default App;