import React from 'react';
import { supabase } from '../supabaseClient';

const ProfileScreen = ({ session }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">👨‍🍳</div>
        <h2>{session?.user?.email}</h2>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default ProfileScreen;