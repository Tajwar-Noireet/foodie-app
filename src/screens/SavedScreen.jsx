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

      // 2. Fetch those specific recipes using our  view!
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
      // 🚨 Adjusted for the tab view
      <div className="empty-state" style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)', opacity: 0.7 }}>
        <span style={{ fontSize: '50px' }}>🔒</span>
        <p>Please log in to see your cookbook!</p>
      </div>
    );
  }

  return (
    // 🚨 Modified padding so it sits flush inside the Kitchen tab
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0' }}>
      
      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)' }}>Opening the cookbook...</p>
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
            // 🚨 Styled to match the Shopping List empty state!
            <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '50px', color: 'var(--text-color)', opacity: 0.7 }}>
              <span style={{ fontSize: '50px' }}>❤️</span>
              <p>You haven't saved any recipes yet.</p>
              <p>Go explore and star some!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}