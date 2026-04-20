import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const ExploreScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // These should match the categories in your CreateScreen
  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Main Course", "Dessert", "Vegan"];

  useEffect(() => {
    fetchFilteredRecipes();
  }, [activeCategory]); // Runs every time the user clicks a new chip

  const fetchFilteredRecipes = async () => {
    setLoading(true);
    
    // Start the query
    let query = supabase.from('recipes').select('*');

    // If a specific category is picked, add a filter
    if (activeCategory !== 'All') {
      query = query.eq('cuisine', activeCategory);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Filter error:", error);
    } else {
      setRecipes(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="explore-container">
      <h1 className="feed-title">Explore</h1>

      {/* CATEGORY CHIPS */}
      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FILTERED RESULTS */}
      {loading ? (
        <div className="loading">Searching the pantry...</div>
      ) : (
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <RecipeCard 
                key={r.id} 
                id={r.id} 
                title={r.title} 
                image={r.image_url} 
                chef="Chef Gordon" 
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No {activeCategory} recipes yet. Be the first to cook one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;