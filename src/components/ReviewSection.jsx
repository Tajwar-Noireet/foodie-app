import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ReviewSection({ recipeId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State (New Review)
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);

  // --- NEW: Edit States ---
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (recipeId) fetchReviews();
  }, [recipeId, currentUser]); // Added currentUser to dependency array to catch late logins

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews_with_users')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      if (currentUser) {
        const userReview = data.find(r => r.user_id === currentUser.id);
        setHasReviewed(!!userReview);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Log in to leave a review!");

    try {
      const { error } = await supabase.from('reviews').insert([{
        recipe_id: recipeId,
        user_id: currentUser.id,
        rating: newRating,
        content: newComment
      }]);

      if (error) throw error;

      toast.success("Review posted!");
      setNewComment('');
      setNewRating(5);
      setHasReviewed(true);
      fetchReviews(); // Refresh the list
    } catch (err) {
      toast.error("Error posting review. You may have already reviewed this!");
      console.error(err);
    }
  };

  // --- NEW: DELETE LOGIC ---
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;

      toast.success("Review deleted!");
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setHasReviewed(false); // Let them review again!
    } catch (err) {
      toast.error("Could not delete review.");
      console.error(err);
    }
  };

  // --- NEW: EDIT LOGIC ---
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  const saveEdit = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ rating: editRating, content: editContent })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success("Review updated!");
      // Instantly update the screen
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, rating: editRating, content: editContent } : r
      ));
      setEditingReviewId(null);
    } catch (err) {
      toast.error("Could not update review.");
      console.error(err);
    }
  };

  // Quick helper to render stars
  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="review-section" style={{ marginTop: '40px', borderTop: '1px solid var(--border-color, #dbdbdb)', paddingTop: '20px' }}>
      <h2>Reviews & Comments</h2>

      {/* THE NEW REVIEW FORM */}
      {currentUser && !hasReviewed ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', background: 'var(--hover-bg, #f9f9f9)', padding: '15px', borderRadius: '8px' }}>
          
          {/* THE NEW SLIDER */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Rating: <span style={{ color: '#f59e0b' }}>{renderStars(newRating)}</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1" 
              value={newRating} 
              onChange={(e) => setNewRating(Number(e.target.value))} 
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--text-color, #000)' }} 
            />
          </div>

          <textarea 
            placeholder="What did you think of this recipe?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border-color, #ccc)', background: 'var(--bg-color, #fff)', color: 'var(--text-color, #000)', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ background: 'var(--accent-color, #0095f6)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Post Review
          </button>
        </form>
      ) : (
        currentUser && hasReviewed && <p style={{ color: '#4ade80', fontWeight: 'bold' }}>✓ You have reviewed this recipe.</p>
      )}

      {/* THE REVIEW LIST */}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: 'var(--bg-color, #fff)', border: '1px solid var(--border-color, #efefef)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* IS THIS REVIEW IN EDIT MODE? */}
              {editingReviewId === review.id ? (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    Update Rating: <span style={{ color: '#f59e0b' }}>{renderStars(editRating)}</span>
                  </label>
                  <input 
                    type="range" min="1" max="5" step="1" 
                    value={editRating} 
                    onChange={(e) => setEditRating(Number(e.target.value))} 
                    style={{ width: '100%', 
    cursor: 'pointer', 
    accentColor: 'var(--text-color, #000)',
    boxSizing: 'border-box', /* THE FIX: Forces strict width calculation */
    margin: '0' }} 
                  />
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                    style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border-color, #ccc)', background: 'var(--bg-color, #fff)', color: 'var(--text-color, #000)', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => saveEdit(review.id)} style={{ background: 'var(--accent-color, #0095f6)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                    <button onClick={() => setEditingReviewId(null)} style={{ background: 'transparent', color: 'var(--text-color, #333)', border: '1px solid var(--border-color, #ccc)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* NORMAL VIEW MODE */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-color, #000)' }}>@{review.username || 'Unknown Chef'}</span>
                    <span style={{ color: '#f59e0b' }}>{renderStars(review.rating)}</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--text-color, #333)' }}>{review.content}</p>
                  
                  {/* EDIT & DELETE BUTTONS (Only visible to the author of the review) */}
                  {currentUser?.id === review.user_id && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => startEditing(review)} style={{ background: 'none', border: 'none', color: 'var(--text-color, #888)', cursor: 'pointer', fontSize: '13px', padding: 0, fontWeight: 'bold' }}>Edit</button>
                      <button onClick={() => handleDelete(review.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: 0, fontWeight: 'bold' }}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#8e8e8e' }}>No reviews yet. Be the first to try it!</p>
      )}
    </div>
  );
}