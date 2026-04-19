import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard'; // Adjust path if needed

const FeedScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setRecipes(data);
    setLoading(false);
  };

  if (loading) return <div className="loading">Checking the oven...</div>;

  return (
    <div className="feed-container">
      <h1 className="feed-title">Your Feed</h1>
      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard 
            key={r.id} 
            id={r.id} 
            title={r.title} 
            image={r.image_url} 
            chef="Chef Gordon" 
          />
        ))}
      </div>
    </div>
  );
};

export default FeedScreen;