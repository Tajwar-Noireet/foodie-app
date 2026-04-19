import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const ExploreScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState('All');
  const categories = ["All", "Main Course", "Dessert", "Dinner", "Vegan"];

  useEffect(() => {
    fetchFiltered();
  }, [filter]);

  const fetchFiltered = async () => {
    let query = supabase.from('recipes').select('*');
    if (filter !== 'All') {
      query = query.eq('cuisine', filter);
    }
    const { data } = await query;
    setRecipes(data || []);
  };

  return (
    <div className="feed-container">
      <h1 className="feed-title">Explore</h1>
      <div className="category-chips">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} id={r.id} title={r.title} image={r.image_url} chef="Chef Gordon" />
        ))}
      </div>
    </div>
  );
};

export default ExploreScreen;