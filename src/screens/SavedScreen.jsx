import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RecipeCard from '../components/RecipeCard';

export default function SavedScreen({ session }) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedRecipes();
  }, [session]);

  const fetchSavedRecipes = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Get the IDs of the recipes this user saved
      const { data: saves, error: saveErr } = await supabase
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', session.user.id);

      if (saveErr) throw saveErr;

      const savedRecipeIds = saves?.map(s => s.recipe_id) || [];

      if (savedRecipeIds.length === 0) {
        setSavedRecipes([]);
        setLoading(false);
        return;
      }

      // 2. Fetch those specific recipes using our BULLETPROOF view!
      const { data: recipes, error: recipeErr } = await supabase
        .from('recipes_with_chefs')
        .select('*')
        .in('id', savedRecipeIds)
        .order('created_at', { ascending: false });

      if (recipeErr) throw recipeErr;

      setSavedRecipes(recipes || []);

    } catch (err) {
      console.error("Error fetching saved recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#8e8e8e' }}>
        <h2>Saved Recipes</h2>
        <p>Please log in to see your cookbook!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>My Cookbook</h1>
      
      {loading ? (
        <p>Opening the cookbook...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {savedRecipes.length > 0 ? (
            savedRecipes.map(r => (
              <RecipeCard 
                key={r.id}
                id={r.id}
                title={r.title}
                image={r.image_url}
                chef={r.chef_name} // Using the view column!
                authorId={r.author_id}
              />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', color: '#8e8e8e' }}>
              You haven't saved any recipes yet. Go explore and star some!
            </p>
          )}
        </div>
      )}
    </div>
  );
}