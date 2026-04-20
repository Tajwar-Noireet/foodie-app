import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const ExploreScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Now using an array for active filters!
  const [activeFilters, setActiveFilters] = useState([]);

  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Dessert", "Vegan", "Snack", "Drink", "Appetizer"];

  useEffect(() => {
    fetchFilteredRecipes();
  }, [activeFilters]); 

  const fetchFilteredRecipes = async () => {
    setLoading(true);
    
    let query = supabase.from('recipes').select('*');

    // If they have selected filters, use the 'overlaps' operator
    if (activeFilters.length > 0) {
      // .overlaps means "Show me recipes where the recipe's cuisine array 
      // shares AT LEAST ONE tag with my activeFilters array"
      query = query.overlaps('cuisine', activeFilters);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) setRecipes(data || []);
    setLoading(false);
  };

  const toggleFilter = (cat) => {
    setActiveFilters((prev) => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="explore-container">
      <h1 className="feed-title">Explore</h1>

      {/* MULTI-SELECT FILTER CHIPS */}
      <div className="category-scroll">
        <button 
          className={`chip ${activeFilters.length === 0 ? 'active' : ''}`}
          onClick={() => setActiveFilters([])}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeFilters.includes(cat) ? 'active' : ''}`}
            onClick={() => toggleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <div className="loading">Searching the pantry...</div>
      ) : (
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <RecipeCard key={r.id} id={r.id} title={r.title} image={r.image_url} chef="Chef Gordon" />
            ))
          ) : (
            <div className="empty-state">
              <p>No recipes found for these filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;