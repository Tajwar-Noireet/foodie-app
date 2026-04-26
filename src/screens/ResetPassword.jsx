import { useState } from 'react';
import { supabase } from '../supabaseClient'; // adjust your import path
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Crucial: Tell Supabase where to send them AFTER they click the email link
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
    <form onSubmit={handlePasswordReset}>
      <h2>Reset Password</h2>
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
}