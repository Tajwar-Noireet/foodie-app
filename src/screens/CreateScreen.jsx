import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const CreateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // File States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Form States
  const [ingredients, setIngredients] = useState([{ amount: '', name: '' }]); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: [] 
  });

  const categories = [
    "Breakfast", "Lunch", "Dinner", "Main Course", 
    "Appetizer", "Dessert", "Snack", "Vegan", "Drink"
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { amount: '', name: '' }]);
  
  const updateIngredient = (index, field, value) => {
    const newIngs = [...ingredients];
    newIngs[index][field] = value;
    setIngredients(newIngs);
  };
  
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  // --- NEW: DRAG AND DROP FUNCTIONS ---
  const handleDragStart = (e, index) => {
    // "Remember" which item we just picked up
    e.dataTransfer.setData("draggedIndex", index);
  };

  const handleDragOver = (e) => {
    // This is required to allow the drop to happen
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("draggedIndex"));
    
    // If we dropped it in the exact same spot, do nothing
    if (sourceIndex === targetIndex) return;

    // Reorder the array
    const newIngredients = [...ingredients];
    const [draggedItem] = newIngredients.splice(sourceIndex, 1); // Remove from old spot
    newIngredients.splice(targetIndex, 0, draggedItem); // Insert into new spot
    
    setIngredients(newIngredients); // Update the screen!
  };
  // ------------------------------------

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const currentList = prev.cuisine || [];
      if (currentList.includes(cat)) {
        return { ...prev, cuisine: currentList.filter(c => c !== cat) };
      } else {
        return { ...prev, cuisine: [...currentList, cat] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first!");

      // 1. Upload Image
      let finalImageUrl = '';
      if (imageFile) {
        const fileName = `${Math.random()}-${imageFile.name}`;
        const { error: imgErr } = await supabase.storage.from('recipe-images').upload(fileName, imageFile, {
            onUploadProgress: (p) => setProgress(Math.round((p.loaded / p.total) * 40))
        });
        if (imgErr) throw imgErr;
        finalImageUrl = supabase.storage.from('recipe-images').getPublicUrl(fileName).data.publicUrl;
      }

      // 2. Upload Video
      let finalVideoUrl = '';
      if (videoFile) {
        const fileName = `${Math.random()}.mp4`;
        const { error: vidErr } = await supabase.storage.from('recipe-videos').upload(fileName, videoFile, {
            onUploadProgress: (p) => setProgress(40 + Math.round((p.loaded / p.total) * 40))
        });
        if (vidErr) throw vidErr;
        finalVideoUrl = supabase.storage.from('recipe-videos').getPublicUrl(fileName).data.publicUrl;
      }

      // 3. Insert Recipe
      const { data: recipe, error: recipeErr } = await supabase
        .from('recipes')
        .insert([{ 
          ...formData, 
          image_url: finalImageUrl, 
          video_url: finalVideoUrl,
          author_id: user.id 
        }])
        .select().single();

      if (recipeErr) throw recipeErr;

      // 4. Link Ingredients
      for (const ing of ingredients) {
        if (!ing.name.trim()) continue; 
        const { data: ingData } = await supabase
          .from('ingredients')
          .upsert({ name: ing.name.trim().toLowerCase() }, { onConflict: 'name' })
          .select().single();

        if (ingData) {
          await supabase.from('recipe_ingredients').insert({
            recipe_id: recipe.id,
            ingredient_id: ingData.id,
            amount: ing.amount.trim() 
          });
        }
      }

      setProgress(100);
      toast.success("Recipe Published! 🍳✨");
      
      // Reset
      setFormData({ title: '', description: '', cuisine: [] });
      setIngredients([{ amount: '', name: '' }]); 
      setImagePreview(null);
      setVideoPreview(null);
      
   } catch (err) {
      toast.error(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <h1 className="feed-title">New Recipe</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        
        <div className="upload-grid">
            <label className="image-placeholder">
              {imagePreview ? <img src={imagePreview} className="img-preview" /> : <div>📸 Photo</div>}
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <label className="video-placeholder">
              {videoPreview ? <video src={videoPreview} className="video-preview-player" /> : <div>🎬 Video</div>}
              <input type="file" accept="video/*" onChange={handleVideoChange} hidden />
            </label>
        </div>

        <div className="input-group">
          <label>Title</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="input-group">
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

        <div className="ingredients-section" style={{ marginTop: '30px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Ingredients</label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ingredients.map((ing, index) => (
              <div 
                key={index} 
                draggable // <-- NEW: Makes the row grabbable
                onDragStart={(e) => handleDragStart(e, index)} // <-- NEW
                onDragOver={handleDragOver} // <-- NEW
                onDrop={(e) => handleDrop(e, index)} // <-- NEW
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  background: '#f8f9fa', 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  border: '1px solid #eaeaea',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  cursor: 'grab' // <-- NEW: Changes the mouse when hovering over the card
                }}
              >
                {/* Visual Grip Handle */}
                <span style={{ color: '#bbb', fontSize: '18px', cursor: 'grab', userSelect: 'none' }}>⋮⋮</span>

                <input 
                  type="text" 
                  placeholder="e.g. 2 Cups" 
                  value={ing.amount} 
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)} 
                  style={{ 
                    flex: '0 0 100px', 
                    border: 'none', 
                    background: 'transparent', 
                    borderBottom: '2px solid #ddd', 
                    padding: '8px 4px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #0095f6'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #ddd'}
                />
                
                <input 
                  type="text" 
                  placeholder="e.g. All-Purpose Flour" 
                  value={ing.name} 
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)} 
                  required
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent', 
                    borderBottom: '2px solid #ddd', 
                    padding: '8px 4px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #0095f6'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #ddd'}
                />

                <button 
                  type="button" 
                  onClick={() => removeIngredient(index)} 
                  style={{ 
                    background: '#ffebee', 
                    color: '#d32f2f', 
                    border: 'none', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#ffcdd2'}
                  onMouseLeave={(e) => e.target.style.background = '#ffebee'}
                  title="Remove Ingredient"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addIngredient}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '14px',
              background: '#f0f8ff',
              border: '2px dashed #82b1ff',
              borderRadius: '12px',
              color: '#0095f6',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#e3f2fd'; e.target.style.borderColor = '#0095f6'; }}
            onMouseLeave={(e) => { e.target.style.background = '#f0f8ff'; e.target.style.borderColor = '#82b1ff'; }}
          >
            + Add Another Ingredient
          </button>
        </div>

        <div className="input-group">
          <label>Instructions</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>

        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Recipe'}
        </button>
      </form>
    </div>
  );
};

export default CreateScreen;