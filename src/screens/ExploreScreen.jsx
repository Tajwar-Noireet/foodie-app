import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const ExploreScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chip Filters
  const [activeFilters, setActiveFilters] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Dessert", "Vegan", "Snack", "Drink", "Appetizer"];

  // Search Bar States
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 

  useEffect(() => {
    fetchFilteredRecipes();
  }, [activeFilters, activeSearch]); 

  const fetchFilteredRecipes = async () => {
    setLoading(true);
    let query = supabase.from('recipes_with_chefs').select('*');

    // 1. Filter by Categories (Chips)
    if (activeFilters.length > 0) {
      query = query.overlaps('cuisine', activeFilters);
    }

    // 2. Filter by Search Text
    if (activeSearch.trim()) {
      query = query.ilike('title', `%${activeSearch}%`);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    setActiveSearch(searchTerm); 
  };

  return (
    <div className="explore-container">
      <h1 className="feed-title">Explore</h1>

      {/* NEW SEARCH BAR */}
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search for 'Chicken', 'Pasta'..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>

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

      {/* RESULTS GRID - SKELETON LOADER ADDED HERE */}
      {loading ? (
        <div className="recipe-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card"></div>
          ))}
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.length > 0 ? (
              recipes.map((r) => (
                <RecipeCard 
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  image={r.image_url}
                  chef={r.chef_name || "Unknown Chef"} 
                  authorId={r.author_id}
                />
              ))
            ) : (
            <div className="empty-state">
              <p>No recipes found. Try a different search or filter!</p>
              {(activeSearch || activeFilters.length > 0) && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveSearch('');
                    setActiveFilters([]);
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;