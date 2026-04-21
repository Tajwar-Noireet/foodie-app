import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';

const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchRecipeDetails();
    // Get the currently logged-in user
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [id]);

  // NEW: Check if the user has already saved this recipe once we know who the user is
  useEffect(() => {
    if (currentUser?.id && id) {
      checkSaveStatus();
    }
  }, [currentUser, id]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select(`*, recipe_ingredients (amount, ingredients (name))`)
      .eq('id', id)
      .single();

    if (error) navigate('/'); 
    else setRecipe(data);
    
    setLoading(false);
  };

  // NEW: Database check for save status
  const checkSaveStatus = async () => {
    const { data } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('recipe_id', id)
      .maybeSingle();
      
    setIsSaved(!!data);
  };

  // NEW: Toggle Save Function
  const toggleSave = async () => {
    if (!currentUser?.id) {
      toast.error("Please log in to save recipes!");
      return;
    }

    try {
      if (isSaved) {
        // Unsave
        await supabase.from('saved_recipes').delete()
          .match({ user_id: currentUser.id, recipe_id: id });
        setIsSaved(false);
        toast.success("Removed from cookbook!");
      } else {
        // Save
        await supabase.from('saved_recipes').insert([
          { user_id: currentUser.id, recipe_id: id }
        ]);
        setIsSaved(true);
        toast.success("Saved to cookbook!");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
    
    if (error) {
      toast.error("Error deleting recipe: " + error.message); 
    } else {
      toast.success("Recipe deleted!"); 
      navigate('/'); 
    }
  };

  if (loading) return <div className="loading-screen">Preparing your meal...</div>;
  if (!recipe) return <div>Recipe not found.</div>;

  // Check if the current user owns this recipe
  const isAuthor = currentUser?.id === recipe.author_id;

  return (
    <div className="detail-container">
      <div className="detail-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* SAVE BUTTON (Visible to any logged-in user) */}
          {currentUser && (
            <button 
              onClick={toggleSave} 
              style={{
                ...actionBtnStyle, 
                backgroundColor: isSaved ? '#1D1B20' : '#0095f6', // Dark if saved, blue if not
                color: 'white'
              }}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
          )}

          {/* EDIT & DELETE BUTTONS (Only visible to the author) */}
          {isAuthor && (
            <>
              <button onClick={() => navigate(`/edit/${recipe.id}`)} style={actionBtnStyle}>✏️ Edit</button>
              <button onClick={handleDelete} style={{...actionBtnStyle, color: 'red'}}>🗑️ Delete</button>
            </>
          )}
        </div>
      </div>
      
      <div className="detail-header">
        {/* Render multiple categories if it's an array */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {(recipe.cuisine || []).map(cat => (
             <span key={cat} className="detail-category">{cat}</span>
          ))}
        </div>
        <h1 className="detail-title">{recipe.title}</h1>
      </div>

      <div className="detail-media">
        {recipe.video_url ? (
          <video src={recipe.video_url} controls className="detail-video" />
        ) : (
          <img src={recipe.image_url} alt={recipe.title} className="detail-img" />
        )}
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Ingredients</h3>
          <ul className="ingredients-list">
            {recipe.recipe_ingredients?.map((item, index) => (
              <li key={index}><strong>{item.amount}</strong> {item.ingredients.name}</li>
            ))}
          </ul>
        </div>
        <div className="detail-section">
          <h3>Instructions</h3>
          <p className="detail-description">{recipe.description}</p>
        </div>
      </div>
      {/* 👇 DROP THIS EXACTLY HERE! 👇 */}
      <ReviewSection recipeId={recipe.id} currentUser={currentUser} />
    </div>
  );
};

// Quick inline style for the buttons so you don't have to hunt for CSS
const actionBtnStyle = {
  background: '#f4f4f5', border: 'none', padding: '8px 16px', 
  borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
};

export default RecipeDetailScreen;