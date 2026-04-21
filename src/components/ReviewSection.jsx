import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ReviewSection({ recipeId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5); // Default to 5 stars
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (recipeId) fetchReviews();
  }, [recipeId]);

  const fetchReviews = async () => {
    setLoading(true);
    // Fetch from our bulletproof view!
    const { data, error } = await supabase
      .from('reviews_with_users')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      // Check if the current user already left a review
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
      fetchReviews(); // Refresh the list
    } catch (err) {
      toast.error("Error posting review. You may have already reviewed this!");
      console.error(err);
    }
  };

  // Quick helper to render stars
  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="review-section" style={{ marginTop: '40px', borderTop: '1px solid #dbdbdb', paddingTop: '20px' }}>
      <h2>Reviews & Comments</h2>

      {/* THE REVIEW FORM */}
      {currentUser && !hasReviewed ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Rating:</label>
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ padding: '5px' }}>
              <option value={5}>5 Stars - Amazing!</option>
              <option value={4}>4 Stars - Great</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Just Okay</option>
              <option value={1}>1 Star - Didn't like it</option>
            </select>
          </div>
          <textarea 
            placeholder="What did you think of this recipe?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ background: '#0095f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
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
            <div key={review.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>@{review.username || 'Unknown Chef'}</span>
                <span style={{ color: '#f59e0b' }}>{renderStars(review.rating)}</span>
              </div>
              <p style={{ margin: 0, color: '#333' }}>{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#8e8e8e' }}>No reviews yet. Be the first to try it!</p>
      )}
    </div>
  );
}