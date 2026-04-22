import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DesktopSidebar from './components/DesktopSidebar'; 
import BottomNav from './components/BottomNav';
import { Toaster } from 'react-hot-toast';
import './App.css';
import MobileHeader from './components/MobileHeader'; // <-- You imported it perfectly here!

// Import your new screens
import FeedScreen from './screens/FeedScreen';
import CreateScreen from './screens/CreateScreen';
import ExploreScreen from './screens/ExploreScreen';
import SavedScreen from './screens/SavedScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import AuthScreen from './screens/AuthScreen';
import EditScreen from './screens/EditScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  // Whenever 'theme' changes, update the HTML tag and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Unlocks the app only AFTER checking login
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-color)'}}>Waking up the database...</div>;
  if (!session) return <AuthScreen />;

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      {/* 2. THE PERMANENT UI (These stay on screen at all times) */}
      <DesktopSidebar toggleTheme={toggleTheme} currentTheme={theme} />
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1D1B20', // Matches your dark theme
            color: '#fff',
            borderRadius: '10px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#4ade80', // A nice modern green
              secondary: '#1D1B20',
            },
          },
        }} 
      />
      
      <div className="main-content">
        
        {/* 🚨 THE NEW MOBILE HEADER (Only visible on mobile screens) 🚨 */}
        <MobileHeader currentTheme={theme}/>

        {/* 3. THE DYNAMIC CONTENT (Only this part changes) */}
        <Routes>
          {/* THE CORE FEEDS */}
          <Route path="/" element={<FeedScreen session={session} />} />
          <Route path="/feed" element={<FeedScreen session={session} />} />
          <Route path="/explore" element={<ExploreScreen session={session} />} />
          
          {/* CREATION & SAVES */}
          <Route path="/create" element={<CreateScreen session={session} />} />
          <Route path="/edit/:id" element={<EditScreen session={session} />} />
          <Route path="/saved" element={<SavedScreen session={session} />} />
          
          {/* PROFILES & DETAILS */}
          <Route path="/profile" element={<ProfileScreen session={session} toggleTheme={toggleTheme} currentTheme={theme} />}/>
          <Route path="/user/:id" element={<PublicProfileScreen session={session} />} />
          <Route path="/recipe/:id" element={<RecipeDetailScreen session={session} />} />
          <Route path="/edit-profile" element={<EditProfileScreen session={session} />} />

          {/* CATCH-ALL (Must be at the very bottom!) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* 4. THE MOBILE NAV (Always at the bottom) */}
      <BottomNav />
    </div>
  );
}

export default App;