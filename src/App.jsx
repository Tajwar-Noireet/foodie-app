import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DesktopSidebar from './components/DesktopSidebar'; 
import BottomNav from './components/BottomNav';
import { Toaster } from 'react-hot-toast';
import './App.css';
import MobileHeader from './components/MobileHeader'; 

// Import screens
import FeedScreen from './screens/FeedScreen';
import CreateScreen from './screens/CreateScreen';
import ExploreScreen from './screens/ExploreScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import AuthScreen from './screens/AuthScreen';
import EditScreen from './screens/EditScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ResetPassword from './screens/ResetPassword';
import UpdatePassword from './screens/UpdatePassword';

import KitchenScreen from './screens/KitchenScreen'; 

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

 
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-color)'}}>Waking up the database...</div>;
  
  // THE NEW BOUNCER: Handles logged-out users but allows password resets!
  if (!session) {
    return (
      <div className="app-layout">
        <Toaster position="top-center" /> 
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* If they aren't on those two specific pages, force them to the AuthScreen */}
          <Route path="*" element={<AuthScreen />} />
        </Routes>
      </div>
    );
  }

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
          
          {/* CREATION & THE KITCHEN HUB */}
          <Route path="/create" element={<CreateScreen session={session} />} />
          <Route path="/edit/:id" element={<EditScreen session={session} />} />
          
          {/* 🚨 REPLACED SAVED & SHOPPING LIST WITH THE KITCHEN HUB */}
          <Route path="/kitchen" element={<KitchenScreen session={session} />} />

          {/* PROFILES & DETAILS */}
          <Route path="/profile" element={<ProfileScreen session={session} toggleTheme={toggleTheme} currentTheme={theme} />}/>
          <Route path="/user/:id" element={<PublicProfileScreen session={session} />} />
          <Route path="/recipe/:id" element={<RecipeDetailScreen session={session} />} />
          <Route path="/edit-profile" element={<EditProfileScreen session={session} />} />
          
          <Route path="/update-password" element={<UpdatePassword />} />

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