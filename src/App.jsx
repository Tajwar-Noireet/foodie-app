import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DesktopSidebar from './components/DesktopSidebar'; 
import BottomNav from './components/BottomNav';
import './App.css';


// Import your new screens
import FeedScreen from './screens/FeedScreen';
import CreateScreen from './screens/CreateScreen';
import ExploreScreen from './screens/ExploreScreen';
import SavedScreen from './screens/SavedScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import AuthScreen from './screens/AuthScreen';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) return <AuthScreen />;

  return (
    <div className="app-layout">
      {/* 2. THE PERMANENT UI (These stay on screen at all times) */}
      <DesktopSidebar /> 
      
      <div className="main-content">
        {/* 3. THE DYNAMIC CONTENT (Only this part changes) */}
        <Routes>
          <Route path="/" element={<FeedScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/create" element={<CreateScreen />} />
          <Route path="/saved" element={<SavedScreen />} />
          <Route path="/profile" element={<ProfileScreen session={session} />} />
          <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* 4. THE MOBILE NAV (Always at the bottom) */}
      <BottomNav />
    </div>
  );
}

export default App;