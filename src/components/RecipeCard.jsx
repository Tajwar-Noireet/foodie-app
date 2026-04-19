import React from 'react';
import './RecipeCard.css';
import { supabase } from '../supabaseClient';

export default function RecipeCard({ id, title, image, chef }) {
  
  const handleSave = async (e) => {
    e.stopPropagation(); // Prevents clicking the heart from opening the recipe detail
    
    // We get the current user's ID from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to save recipes!");
      return;
    }

    const { error } = await supabase
      .from('saved_recipes')
      .insert([{ user_id: user.id, recipe_id: id }]);

    if (error) {
      if (error.code === '23505') alert("Already saved!"); // Postgres 'Unique Violation' code
      else console.error(error);
    } else {
      alert("Saved to your collection!");
    }
  };

  return (
    <div className="recipe-card">
      <div className="save-icon" onClick={handleSave}>🔖</div>
      <img src={image} className="recipe-image" alt={title} />
      <div className="recipe-info">
        <h2 className="recipe-title">{title}</h2>
        <span className="chef-name">By {chef}</span>
      </div>
    </div>
  );
}