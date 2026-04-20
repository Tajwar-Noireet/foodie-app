import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchRecipeDetails();
    // Get the currently logged-in user
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [id]);

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

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
    
    if (error) {
      toast.error("Error deleting recipe: " + error.message); // 2. Replace alert
    } else {
      toast.success("Recipe deleted!"); // 3. Replace alert
      navigate('/'); 
    }
  };

  if (loading) return <div className="loading-screen">Preparing your meal...</div>;
  if (!recipe) return <div>Recipe not found.</div>;

  // Check if the current user owns this recipe
  const isAuthor = currentUser?.id === recipe.author_id;

  return (
    <div className="detail-container">
      <div className="detail-top-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        {/* EDIT & DELETE BUTTONS (Only visible to the author) */}
        {isAuthor && (
          <div className="author-actions" style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate(`/edit/${recipe.id}`)} style={actionBtnStyle}>✏️ Edit</button>
            <button onClick={handleDelete} style={{...actionBtnStyle, color: 'red'}}>🗑️ Delete</button>
          </div>
        )}
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
    </div>
  );
};

// Quick inline style for the buttons so you don't have to hunt for CSS
const actionBtnStyle = {
  background: '#f4f4f5', border: 'none', padding: '8px 16px', 
  borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
};

export default RecipeDetailScreen;