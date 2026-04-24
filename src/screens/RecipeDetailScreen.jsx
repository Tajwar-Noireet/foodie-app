import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';
import ShareButton from '../components/ShareButton';
import { motion } from 'framer-motion';

const RecipeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

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
    // 🚨 JOIN: Fetches recipe + ingredients + the author's profile username
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *, 
        recipe_ingredients (amount, ingredients (name)),
        profiles (username)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error("Could not load recipe.");
      navigate('/'); 
    } else {
      setRecipe(data);
    }
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
        await supabase.from('saved_recipes').delete().match({ user_id: currentUser.id, recipe_id: id });
        setIsSaved(false);
        toast.success("Removed from cookbook!");
      } else {
        await supabase.from('saved_recipes').insert([{ user_id: currentUser.id, recipe_id: id }]);
        setIsSaved(true);
        toast.success("Saved to cookbook!");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
    if (error) toast.error("Error deleting: " + error.message);
    else { toast.success("Recipe deleted!"); navigate('/'); }
  };

  const addToShoppingList = async () => {
    if (!currentUser?.id) {
      toast.error("Please log in to build a shopping list!");
      return;
    }
    if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
      toast.error("No ingredients found!");
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
      const { error: insertErr } = await supabase.from('shopping_list').insert(listItems);
      if (insertErr) throw insertErr;
      toast.success("Ingredients added to your shopping list! 🛒");
    } catch (err) {
      toast.error("Failed to add ingredients.");
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
            <button onClick={toggleSave} style={{...actionBtnStyle, backgroundColor: isSaved ? '#1D1B20' : '#0095f6', color: 'white'}}>
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
         <ShareButton title={recipe.title} text={`I found this amazing ${recipe.title} recipe!`} />
      </div>
      
      <div className="detail-header">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {(recipe.cuisine || []).map(cat => <span key={cat} className="detail-category">{cat}</span>)}
          {(recipe.dietary_tags || []).map(diet => <span key={diet} className="detail-category" style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>{diet}</span>)}
        </div>
        
        <h1 className="detail-title">{recipe.title}</h1>

        {/* 🚨 CHEF PROFILE LINK */}
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
          By <Link 
            to={`/user/${recipe.author_id}`} 
            style={{ color: 'var(--accent-color, #0095f6)', fontWeight: 'bold', textDecoration: 'none' }}
          >
            {recipe.profiles?.username || 'Unknown Chef'}
          </Link>
        </p>
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
              <li key={index}><strong>{item.amount}</strong> {item.ingredients?.name || 'Unknown'}</li>
            ))}
          </ul>

          {/* 🚨 STICKY SHOPPING LIST BUTTON */}
          <div style={{ position: 'sticky', bottom: '20px', background: 'var(--bg-color)', padding: '10px 0', borderTop: '1px solid #eee' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addToShoppingList}
              disabled={addingToList}
              style={{
                width: '100%', padding: '16px', background: 'var(--accent-color, #0095f6)',
                color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold',
                fontSize: '16px', cursor: addingToList ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {addingToList ? 'Adding...' : '🛒 Add to Shopping List'}
            </motion.button>
          </div>
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