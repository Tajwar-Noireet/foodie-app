import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const SavedScreen = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // This query grabs the recipe details THROUGH the saved_recipes table
    const { data, error } = await supabase
      .from('saved_recipes')
      .select(`
        recipes ( id, title, image_url )
      `)
      .eq('user_id', user.id);

    if (!error) {
      // We flatten the data because Supabase returns nested objects for joins
      setSavedRecipes(data.map(item => item.recipes));
    }
    setLoading(false);
  };

  return (
    <div className="feed-container">
      <h1 className="feed-title">Saved Collection</h1>
      {savedRecipes.length === 0 ? <p>No bookmarks yet!</p> : (
        <div className="recipe-grid">
          {savedRecipes.map((r) => (
            <RecipeCard key={r.id} id={r.id} title={r.title} image={r.image_url} chef="Me" />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedScreen;