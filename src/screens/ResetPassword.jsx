import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './AuthScreen.css'; 

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://foodie-app-red.vercel.app/update-password', 
      });

      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Reset Password</h1>
        <p>Enter your email and we'll send you a link to get back into the kitchen.</p>
        
        <form onSubmit={handlePasswordReset}>
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
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/">
          <button className="toggle-btn">Back to Log In</button>
        </Link>
      </div>
    </div>
  );
}