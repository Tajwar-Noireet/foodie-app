import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    // Fetch recipe and join with ingredients through your join table
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          amount,
          ingredients ( name )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      navigate('/'); // Send back home if recipe doesn't exist
    } else {
      setRecipe(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading-screen">Preparing your meal...</div>;
  if (!recipe) return <div>Recipe not found.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="detail-header">
        <span className="detail-category">{recipe.cuisine || 'Main Course'}</span>
        <h1 className="detail-title">{recipe.title}</h1>
        <p className="detail-author">By Chef Gordon</p>
      </div>

      {/* Show Video if it exists, otherwise show Image */}
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
              <li key={index}>
                <strong>{item.amount}</strong> {item.ingredients.name}
              </li>
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

export default RecipeDetailScreen;