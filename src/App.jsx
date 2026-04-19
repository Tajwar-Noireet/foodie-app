// 1. Make sure THESE two are inside the curly braces from 'react'
import { useState, useEffect } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AuthScreen from './AuthScreen';
import RecipeCard from './components/RecipeCard';
import DesktopSidebar from './components/DesktopSidebar';
import BottomNav from './components/BottomNav';
import './App.css';
import CreateScreen from './CreateScreen';
import RecipeDetailScreen from './RecipeDetailScreen'; // Add this line

const FeedScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setRecipes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  if (loading) return <div className="loading">Checking the oven...</div>;

  return (
    <div className="feed-container">
      <h1 className="feed-title">Your Feed</h1>
      
      {/* If there are no recipes, show a message */}
      {recipes.length === 0 && (
        <p style={{ margin: '20px' }}>No recipes found. Be the first to cook something!</p>
      )}

      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard 
            key={r.id} 
            id={r.id} 
            title={r.title} 
            image={r.image_url} // CRITICAL: Map image_url to image
            chef="Chef Gordon"  // Placeholder for now
          />
        ))}
      </div>
    </div>
  );
};

const ExploreScreen = () => <div style={{padding: '40px'}}>Explore Screen Placeholder</div>;




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
      <DesktopSidebar onLogout={handleLogout} /> 
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<FeedScreen />} />
          <Route path="/create" element={<CreateScreen />} /> {/* Now uses the imported file */}
          <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
          <Route path="/saved" element={<SavedScreen />} />
          <Route path="/profile" element={<ProfileScreen session={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
}

export default App;