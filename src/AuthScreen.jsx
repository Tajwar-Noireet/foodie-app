import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './AuthScreen.css';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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
    <div className="auth-container">
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