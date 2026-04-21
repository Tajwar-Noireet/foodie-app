import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function EditProfileScreen({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (session?.user?.id) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "row not found" error

      if (data) {
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;
        finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      }

      // --- THE FIX: Changed .update() to .upsert() ---
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id, // ID is mandatory for upserting!
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: finalAvatarUrl,
          updated_at: new Date()
        });

      if (updateError) throw updateError;

      toast.success('Profile updated! ✨');
      
      // Delay navigation slightly so the DB has time to settle
      setTimeout(() => navigate('/profile'), 500);
      
    } catch (error) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' }}>← Back</button>
      
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Edit Profile</h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', background: '#f0f8ff', 
              border: '2px dashed #0095f6', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              overflow: 'hidden', position: 'relative'
          }}>
            {(avatarPreview || avatarUrl) ? (
              <img src={avatarPreview || avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px' }}>🧑‍🍳</span>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
          </div>
          <span style={{ fontSize: '14px', color: '#0095f6', fontWeight: 'bold' }}>Change Photo</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dbdbdb' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What's your cooking style?"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dbdbdb', minHeight: '100px' }}
          />
        </div>

        <button type="submit" disabled={saving}
          style={{ padding: '14px', borderRadius: '8px', border: 'none', background: '#0095f6', 
          color: 'white', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}