import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';
import ShareButton from '../components/ShareButton';
import { motion } from 'framer-motion'; // 🚨 NEW: Added Framer Motion for the button

const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [addingToList, setAddingToList] = useState(false); // 🚨 NEW: Loading state for the shopping list

  useEffect(() => {
    fetchRecipeDetails();
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [id]);

  useEffect(() => {
    if (currentUser?.id && id) {
      checkSaveStatus();
    }
  }, [currentUser, id]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select(`*, recipe_ingredients (amount, ingredients (name))`)
      .eq('id', id)
      .single();

    if (error) navigate('/'); 
    else setRecipe(data);
    
    setLoading(false);
  };

  const checkSaveStatus = async () => {
    const { data } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('recipe_id', id)
      .maybeSingle();
      
    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (!currentUser?.id) {
      toast.error("Please log in to save recipes!");
      return;
    }

    try {
      if (isSaved) {
        await supabase.from('saved_recipes').delete()
          .match({ user_id: currentUser.id, recipe_id: id });
        setIsSaved(false);
        toast.success("Removed from cookbook!");
      } else {
        await supabase.from('saved_recipes').insert([
          { user_id: currentUser.id, recipe_id: id }
        ]);
        setIsSaved(true);
        toast.success("Saved to cookbook!");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
    
    if (error) {
      toast.error("Error deleting recipe: " + error.message); 
    } else {
      toast.success("Recipe deleted!"); 
      navigate('/'); 
    }
  };

  // 🚨 NEW: Bulk Add to Shopping List Logic
const addToShoppingList = async () => {
    if (!currentUser?.id) {
      toast.error("Please log in to build a shopping list!");
      return;
    }

    // 🚨 THE FIX: Check if the recipe actually has ingredients first!
    if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
      toast.error("This recipe doesn't have any ingredients to add!");
      return;
    }

    setAddingToList(true);

    try {
      const listItems = recipe.recipe_ingredients.map(item => ({
        user_id: currentUser.id,
        ingredient_name: item.ingredients?.name || 'Unknown Ingredient',
        amount: item.amount || '',
        is_bought: false
      }));

      const { error: insertErr } = await supabase
        .from('shopping_list')
        .insert(listItems);

      if (insertErr) throw insertErr;

      toast.success("Ingredients added to your shopping list! 🛒");
      
    } catch (err) {
      toast.error("Failed to add ingredients.");
      console.error(err);
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) return <div className="loading-screen">Preparing your meal...</div>;
  if (!recipe) return <div>Recipe not found.</div>;

  const isAuthor = currentUser?.id === recipe.author_id;

  return (
    <div className="detail-container">
      <div className="detail-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentUser && (
            <button 
              onClick={toggleSave} 
              style={{
                ...actionBtnStyle, 
                backgroundColor: isSaved ? '#1D1B20' : '#0095f6', 
                color: 'white'
              }}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
          )}

          {isAuthor && (
            <>
              <button onClick={() => navigate(`/edit/${recipe.id}`)} style={actionBtnStyle}>✏️ Edit</button>
              <button onClick={handleDelete} style={{...actionBtnStyle, color: 'red'}}>🗑️ Delete</button>
            </>
          )}
        </div>
      </div>

      <div className="recipe-actions-row" style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
         <ShareButton 
           title={recipe.title} 
           text={`I found this amazing ${recipe.title} recipe!`} 
         />
      </div>
      
      <div className="detail-header">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {(recipe.cuisine || []).map(cat => (
             <span key={cat} className="detail-category">{cat}</span>
          ))}
          {/* Also display dietary tags if they exist! */}
          {(recipe.dietary_tags || []).map(diet => (
             <span key={diet} className="detail-category" style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>{diet}</span>
          ))}
        </div>
        <h1 className="detail-title">{recipe.title}</h1>
      </div>

      <div className="detail-media">
        {recipe.video_url ? (
          <video src={recipe.video_url} controls className="detail-video" />
        ) : (
          <img src={recipe.image_url} alt={recipe.title} className="detail-img" />
        )}
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Ingredients</h3>
          <ul className="ingredients-list">
            {recipe.recipe_ingredients?.map((item, index) => (
              <li key={index}><strong>{item.amount}</strong> {item.ingredients.name}</li>
            ))}
          </ul>

          {/* 🚨 THE NEW SHOPPING LIST BUTTON 🚨 */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addToShoppingList}
            disabled={addingToList}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--accent-color, #0095f6)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: addingToList ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px',
              opacity: addingToList ? 0.7 : 1
            }}
          >
            {addingToList ? 'Adding...' : '🛒 Add to Shopping List'}
          </motion.button>

        </div>
        <div className="detail-section">
          <h3>Instructions</h3>
          <p className="detail-description">{recipe.description}</p>
        </div>
      </div>
      
      <ReviewSection recipeId={recipe.id} currentUser={currentUser} />
    </div>
  );
};

const actionBtnStyle = {
  background: '#f4f4f5', border: 'none', padding: '8px 16px', 
  borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
};

export default RecipeDetailScreen;