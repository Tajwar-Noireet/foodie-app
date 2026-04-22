import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Reorder, useDragControls } from 'framer-motion'; // <-- NEW: The animation engine!

// --- NEW: Sub-component for the animated drag row ---
const IngredientRow = ({ ing, index, updateIngredient, removeIngredient }) => {
  const controls = useDragControls(); // Tells Framer Motion to only drag when the grip is touched

  return (
    <Reorder.Item 
      value={ing} 
      id={ing.id} // Framer Motion needs a unique ID to animate properly
      dragListener={false} // Disables dragging the whole row (so you can still type in the inputs!)
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
        marginBottom: '12px' // Spacing between animated rows
      }}
    >
      {/* Visual Grip Handle (Now wired for mobile touch!) */}
      <div 
        onPointerDown={(e) => controls.start(e)} // This is the magic that makes mobile drag work
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


const CreateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // --- UPDATED: Added a random string ID to the initial state for animations ---
  const [ingredients, setIngredients] = useState([{ id: Math.random().toString(), amount: '', name: '' }]); 
  const [formData, setFormData] = useState({
    title: '', description: '', cuisine: [] 
  });

  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Appetizer", "Dessert", "Snack", "Vegan", "Drink"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); }
  };

  // --- UPDATED: Ensures every new row gets a unique ID ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first!");

      let finalImageUrl = '';
      if (imageFile) {
        const fileName = `${Math.random()}-${imageFile.name}`;
        const { error: imgErr } = await supabase.storage.from('recipe-images').upload(fileName, imageFile, {
            onUploadProgress: (p) => setProgress(Math.round((p.loaded / p.total) * 40))
        });
        if (imgErr) throw imgErr;
        finalImageUrl = supabase.storage.from('recipe-images').getPublicUrl(fileName).data.publicUrl;
      }

      let finalVideoUrl = '';
      if (videoFile) {
        const fileName = `${Math.random()}.mp4`;
        const { error: vidErr } = await supabase.storage.from('recipe-videos').upload(fileName, videoFile, {
            onUploadProgress: (p) => setProgress(40 + Math.round((p.loaded / p.total) * 40))
        });
        if (vidErr) throw vidErr;
        finalVideoUrl = supabase.storage.from('recipe-videos').getPublicUrl(fileName).data.publicUrl;
      }

      const { data: recipe, error: recipeErr } = await supabase
        .from('recipes')
        .insert([{ ...formData, image_url: finalImageUrl, video_url: finalVideoUrl, author_id: user.id }])
        .select().single();

      if (recipeErr) throw recipeErr;

      for (const ing of ingredients) {
        if (!ing.name.trim()) continue; 
        const { data: ingData } = await supabase
          .from('ingredients')
          .upsert({ name: ing.name.trim().toLowerCase() }, { onConflict: 'name' })
          .select().single();

        if (ingData) {
          await supabase.from('recipe_ingredients').insert({
            recipe_id: recipe.id, ingredient_id: ingData.id, amount: ing.amount.trim() 
          });
        }
      }

      setProgress(100);
      toast.success("Recipe Published! 🍳✨");
      setFormData({ title: '', description: '', cuisine: [] });
      setIngredients([{ id: Math.random().toString(), amount: '', name: '' }]); 
      setImagePreview(null);
      setVideoPreview(null);
      
    } catch (err) {
      toast.error(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container" style={{ width: '100%', boxSizing: 'border-box' }}>
      <h1 className="feed-title">New Recipe</h1>
      <form className="create-form" onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
        
        <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
            <label className="image-placeholder">
              {imagePreview ? <img src={imagePreview} className="img-preview" alt="preview" /> : <div>📸 Photo</div>}
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <label className="video-placeholder">
              {videoPreview ? <video src={videoPreview} className="video-preview-player" /> : <div>🎬 Video</div>}
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

        <div className="ingredients-section" style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Ingredients</label>

          {/* THE NEW ANIMATED LIST */}
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

        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%`, background: 'var(--accent-color)' }}></div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', boxSizing: 'border-box' }}>
          {loading ? 'Publishing...' : 'Publish Recipe'}
        </button>
      </form>
    </div>
  );
};

export default CreateScreen;