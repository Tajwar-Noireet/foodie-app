import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

const ExploreScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR FILTERS ---
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeDietaryFilters, setActiveDietaryFilters] = useState([]); // 🚨 NEW: Dietary state
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [activeRating, setActiveRating] = useState(0);

  // 🚨 NEW: Updated arrays (Vegan moved to dietaryOptions)
  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Dessert", "Snack", "Drink", "Appetizer"];
  const dietaryOptions = ["Vegan", "Vegetarian", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Nut-Free"];

  // 🚨 NEW: Added activeDietaryFilters to the dependency array
  useEffect(() => {
    fetchFilteredRecipes();
  }, [activeFilters, activeDietaryFilters, activeSearch, activeRating]); 

  const fetchFilteredRecipes = async () => {
    setLoading(true);
    let query = supabase.from('recipes_with_chefs').select('*');

    // 1. Filter by Cuisine (Meal Type)
    if (activeFilters.length > 0) {
      query = query.overlaps('cuisine', activeFilters);
    }
    
    // 2. Filter by Dietary Tags 🚨 NEW
    if (activeDietaryFilters.length > 0) {
      query = query.overlaps('dietary_tags', activeDietaryFilters);
    }

    // 3. Filter by Search Term
    if (activeSearch.trim()) {
      query = query.ilike('title', `%${activeSearch}%`);
    }

    // 4. Filter by Rating
    if (activeRating > 0) {
      query = query.gte('rating', activeRating).order('rating', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("🚨 SUPABASE ERROR:", error.message);
      setRecipes([]);
    } else {
      setRecipes(data || []);
    }
    setLoading(false);
  };

  const toggleFilter = (cat) => {
    setActiveFilters((prev) => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // 🚨 NEW: Toggle function for Dietary Tags
  const toggleDietaryFilter = (diet) => {
    setActiveDietaryFilters((prev) => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  return (
    <div className="explore-container">
      <h1 className="feed-title">Explore</h1>

      {/* SEARCH BAR */}
      <form className="search-form" onSubmit={(e) => { e.preventDefault(); setActiveSearch(searchTerm); }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search for 'Chicken', 'Pasta'..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>

      {/* THE RATING SLIDER */}
      <div className="rating-slider-container">
        <div className="rating-header">
          <span>Minimum Rating:</span>
          <span>{activeRating === 0 ? 'Any Rating' : `${activeRating}+ ⭐`}</span>
        </div>
        <input 
          type="range" min="0" max="5" step="1" 
          value={activeRating}
          onChange={(e) => setActiveRating(Number(e.target.value))}
          className="rating-slider"
        />
        <div className="rating-labels">
          <span>All</span>
          <span>5 Stars</span>
        </div>
      </div>

      {/* MULTI-SELECT CATEGORY CHIPS (Meal Types) */}
      <div className="category-scroll">
        <button className={`chip ${activeFilters.length === 0 ? 'active' : ''}`} onClick={() => setActiveFilters([])}>
          All Meals
        </button>
        {categories.map((cat) => (
          <button key={cat} className={`chip ${activeFilters.includes(cat) ? 'active' : ''}`} onClick={() => toggleFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* 🚨 NEW: MULTI-SELECT DIETARY CHIPS */}
      <div className="category-scroll" style={{ marginTop: '10px' }}>
        <button className={`chip ${activeDietaryFilters.length === 0 ? 'active' : ''}`} onClick={() => setActiveDietaryFilters([])}>
          Any Diet
        </button>
        {dietaryOptions.map((diet) => (
          <button 
            key={diet} 
            className={`chip ${activeDietaryFilters.includes(diet) ? 'active' : ''}`} 
            onClick={() => toggleDietaryFilter(diet)}
            style={{ borderColor: activeDietaryFilters.includes(diet) ? 'var(--accent-color)' : '#4ade80' }} // Optional: Green border to distinguish them!
          >
            {diet}
          </button>
        ))}
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <div className="recipe-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="skeleton-card"></div>)}
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <RecipeCard 
                key={r.id} id={r.id} title={r.title} image={r.image_url}
                chef={r.chef_name || "Unknown Chef"} authorId={r.author_id} rating={r.rating}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No recipes found. Try a different search or filter!</p>
              {/* 🚨 NEW: Clear All Filters now resets the dietary tags too! */}
              {(activeSearch || activeFilters.length > 0 || activeDietaryFilters.length > 0 || activeRating > 0) && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm(''); setActiveSearch(''); setActiveFilters([]); setActiveDietaryFilters([]); setActiveRating(0);
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