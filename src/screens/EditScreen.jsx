import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Reorder, useDragControls } from 'framer-motion'; 

const IngredientRow = ({ ing, index, updateIngredient, removeIngredient }) => {
  const controls = useDragControls(); 

  return (
    <Reorder.Item 
      value={ing} 
      id={ing.id} 
      dragListener={false} 
      dragControls={controls}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        background: 'var(--hover-bg, #f8f9fa)', 
        padding: '12px 10px', 
        borderRadius: '12px',
        border: '1px solid var(--border-color, #eaeaea)',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '12px' 
      }}
    >
      <div 
        onPointerDown={(e) => controls.start(e)} 
        style={{ color: 'var(--text-color)', opacity: 0.4, fontSize: '18px', cursor: 'grab', userSelect: 'none', touchAction: 'none', padding: '0 5px' }}
      >
        ⋮⋮
      </div>

      <input 
        type="text" 
        placeholder="e.g. 2 Cups" 
        value={ing.amount} 
        onChange={(e) => updateIngredient(index, 'amount', e.target.value)} 
        style={{ 
          flex: 1, minWidth: 0, border: 'none', background: 'transparent', 
          borderBottom: '2px solid var(--border-color, #ddd)', padding: '8px 4px',
          fontSize: '15px', outline: 'none', color: 'var(--text-color)'
        }}
        onFocus={(e) => e.target.style.borderBottom = '2px solid var(--accent-color, #0095f6)'}
        onBlur={(e) => e.target.style.borderBottom = '2px solid var(--border-color, #ddd)'}
      />
      
      <input 
        type="text" 
        placeholder="e.g. Flour" 
        value={ing.name} 
        onChange={(e) => updateIngredient(index, 'name', e.target.value)} 
        required
        style={{ 
          flex: 2, minWidth: 0, border: 'none', background: 'transparent', 
          borderBottom: '2px solid var(--border-color, #ddd)', padding: '8px 4px',
          fontSize: '15px', outline: 'none', color: 'var(--text-color)'
        }}
        onFocus={(e) => e.target.style.borderBottom = '2px solid var(--accent-color, #0095f6)'}
        onBlur={(e) => e.target.style.borderBottom = '2px solid var(--border-color, #ddd)'}
      />

      <button 
        type="button" 
        onClick={() => removeIngredient(index)} 
        style={{ 
          background: 'none', color: '#d32f2f', border: 'none', 
          flexShrink: 0, cursor: 'pointer', fontSize: '18px', padding: '0 5px'
        }}
        title="Remove Ingredient"
      >
        ✕
      </button>
    </Reorder.Item>
  );
};


const EditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  const [ingredients, setIngredients] = useState([]); 
  
  const [formData, setFormData] = useState({
    title: '', description: '', cuisine: [], dietary_tags: [] 
  });

  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Appetizer", "Dessert", "Snack", "Drink"];
  const dietaryOptions = ["Vegan", "Vegetarian", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal"];

  // Fetch the existing recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        // 1. Fetch main recipe details
        const { data: recipe, error: recipeErr } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (recipeErr) throw recipeErr;

        if (recipe) {
          setFormData({
            title: recipe.title || '',
            description: recipe.description || '',
            cuisine: recipe.cuisine || [],
            dietary_tags: recipe.dietary_tags || []
          });
          
          setImagePreview(recipe.image_url);
          setExistingImageUrl(recipe.image_url);
          
          setVideoPreview(recipe.video_url);
          setExistingVideoUrl(recipe.video_url);
        }

        // 2. Fetch ingredients
        const { data: ingData, error: ingErr } = await supabase
          .from('recipe_ingredients')
          .select(`amount, ingredients (name)`)
          .eq('recipe_id', id);

        if (ingData && ingData.length > 0) {
          const formattedIngs = ingData.map(row => ({
            id: Math.random().toString(), // Generates ID for Framer Motion Reorder
            amount: row.amount || '',
            name: row.ingredients?.name || ''
          }));
          setIngredients(formattedIngs);
        } else {
          setIngredients([{ id: Math.random().toString(), amount: '', name: '' }]);
        }

      } catch (err) {
        toast.error("Failed to load recipe: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipe();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); }
  };

  const addIngredient = () => setIngredients([...ingredients, { id: Math.random().toString(), amount: '', name: '' }]);
  
  const updateIngredient = (index, field, value) => {
    const newIngs = [...ingredients];
    newIngs[index][field] = value;
    setIngredients(newIngs);
  };
  
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const currentList = prev.cuisine || [];
      if (currentList.includes(cat)) return { ...prev, cuisine: currentList.filter(c => c !== cat) };
      return { ...prev, cuisine: [...currentList, cat] };
    });
  };

  const toggleDietary = (diet) => {
    setFormData((prev) => {
      const currentList = prev.dietary_tags || [];
      if (currentList.includes(diet)) return { ...prev, dietary_tags: currentList.filter(d => d !== diet) };
      return { ...prev, dietary_tags: [...currentList, diet] };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first!");

      let finalImageUrl = existingImageUrl;
      if (imageFile) {
        const fileName = `${Math.random()}-${imageFile.name}`;
        const { error: imgErr } = await supabase.storage.from('recipe-images').upload(fileName, imageFile, {
            onUploadProgress: (p) => setProgress(Math.round((p.loaded / p.total) * 40))
        });
        if (imgErr) throw imgErr;
        finalImageUrl = supabase.storage.from('recipe-images').getPublicUrl(fileName).data.publicUrl;
      }

      let finalVideoUrl = existingVideoUrl;
      if (videoFile) {
        const fileName = `${Math.random()}.mp4`;
        const { error: vidErr } = await supabase.storage.from('recipe-videos').upload(fileName, videoFile, {
            onUploadProgress: (p) => setProgress(40 + Math.round((p.loaded / p.total) * 40))
        });
        if (vidErr) throw vidErr;
        finalVideoUrl = supabase.storage.from('recipe-videos').getPublicUrl(fileName).data.publicUrl;
      }

      // Update the main recipe
      const { error: recipeErr } = await supabase
        .from('recipes')
        .update({ 
          ...formData, 
          image_url: finalImageUrl, 
          video_url: finalVideoUrl 
        })
        .eq('id', id);

      if (recipeErr) throw recipeErr;

      // Update Ingredients: Delete old ones, insert new ones
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

      for (const ing of ingredients) {
        if (!ing.name.trim()) continue; 
        const { data: ingData } = await supabase
          .from('ingredients')
          .upsert({ name: ing.name.trim().toLowerCase() }, { onConflict: 'name' })
          .select().single();

        if (ingData) {
          await supabase.from('recipe_ingredients').insert({
            recipe_id: id, ingredient_id: ingData.id, amount: ing.amount.trim() 
          });
        }
      }

      setProgress(100);
      toast.success("Recipe Updated! 🍳✨");
      navigate(`/recipe/${id}`); 
      
    } catch (err) {
      toast.error(err.message); 
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading recipe data...</div>;

  return (
    <div className="create-container" style={{ width: '100%', boxSizing: 'border-box' }}>
      <h1 className="feed-title">Edit Recipe</h1>
      <form className="create-form" onSubmit={handleUpdate} style={{ width: '100%', boxSizing: 'border-box' }}>
        
        <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
            <label className="image-placeholder">
              {imagePreview ? <img src={imagePreview} className="img-preview" alt="preview" /> : <div style={{ color: 'var(--text-color)' }}>📸 Photo</div>}
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <label className="video-placeholder">
              {videoPreview ? <video src={videoPreview} className="video-preview-player" /> : <div style={{ color: 'var(--text-color)' }}>🎬 Video</div>}
              <input type="file" accept="video/*" onChange={handleVideoChange} hidden />
            </label>
        </div>

        <div className="input-group">
          <label>Title</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ minWidth: 0, boxSizing: 'border-box' }}/>
        </div>

        <div className="input-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <label>Meal Types (Select multiple)</label>
          <div className="category-scroll">
            {categories.map((cat) => (
              <button 
                type="button" 
                key={cat}
                className={`chip ${(formData.cuisine || []).includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group" style={{ maxWidth: '100%', overflow: 'hidden', marginTop: '10px' }}>
          <label>Dietary Restrictions (Select multiple)</label>
          <div className="category-scroll">
            {dietaryOptions.map((diet) => (
              <button 
                type="button" 
                key={diet}
                className={`chip ${(formData.dietary_tags || []).includes(diet) ? 'active' : ''}`}
                onClick={() => toggleDietary(diet)}
                style={{ borderColor: (formData.dietary_tags || []).includes(diet) ? 'var(--accent-color)' : '#4ade80' }} 
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div className="ingredients-section" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Ingredients</label>

          <div style={{ width: '100%' }}>
            <Reorder.Group 
              axis="y" 
              values={ingredients} 
              onReorder={setIngredients} 
              style={{ listStyleType: 'none', padding: 0, margin: 0, width: '100%' }}
            >
              {ingredients.map((ing, index) => (
                <IngredientRow 
                  key={ing.id} 
                  ing={ing} 
                  index={index} 
                  updateIngredient={updateIngredient} 
                  removeIngredient={removeIngredient} 
                />
              ))}
            </Reorder.Group>
          </div>

          <button 
            type="button" 
            onClick={addIngredient}
            style={{
              width: '100%', marginTop: '15px', padding: '14px', background: 'transparent',
              border: '2px dashed var(--accent-color, #0095f6)', borderRadius: '12px',
              color: 'var(--accent-color, #0095f6)', fontWeight: 'bold', cursor: 'pointer',
              fontSize: '15px', boxSizing: 'border-box'
            }}
          >
            + Add Another Ingredient
          </button>
        </div>

        <div className="input-group">
          <label>Instructions</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ minWidth: 0, boxSizing: 'border-box', color: 'var(--text-color)', background: 'var(--bg-color)' }} />
        </div>

        {saving && progress > 0 && progress < 100 && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%`, background: 'var(--accent-color)' }}></div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }}>
          {saving ? 'Saving Changes...' : 'Update Recipe'}
        </button>
      </form>
    </div>
  );
};

export default EditScreen;