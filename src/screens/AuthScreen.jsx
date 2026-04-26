import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion'; // 🚨 NEW: Imported Framer Motion
import './AuthScreen.css';
import { Link } from 'react-router-dom';

// 🚨 NEW: Import your logos
import logoLight from '../assets/images/logo.png';       
import logoDark from '../assets/images/logo-white.png'; 

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Quick check for theme so the logo matches the user's system/preference
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for a confirmation link (if enabled)!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      
      {/* 🚨 THE ANIMATED HOVERING LOGO 🚨 */}
      <motion.img 
        src={currentTheme === 'dark' ? logoDark : logoLight} 
        alt="App Logo" 
        style={{ width: '180px', marginBottom: '30px' }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      <div className="auth-box">
        <h1>{isSignUp ? 'Join the Kitchen' : 'Welcome Back'}</h1>
        <p>{isSignUp ? 'Create an account to start sharing.' : 'Login to manage your recipes.'}</p>
        
        <form onSubmit={handleAuth}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="chef@gordon.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {/* 🚨 THE NEW FORGOT PASSWORD LINK 🚨 */}
          {/* It only shows up when the user is trying to Log In */}
          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
              <Link 
                to="/reset-password" 
                style={{ 
                  color: 'var(--primary-color, #3b82f6)', 
                  fontSize: '0.85rem', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <button className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}