import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const CreateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // File States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Form States
  const [ingredients, setIngredients] = useState(['']); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: 'Dinner' // Default type
  });

  // Updated Category List
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

  const addIngredient = () => setIngredients([...ingredients, '']);
  const updateIngredient = (index, value) => {
    const newIngs = [...ingredients];
    newIngs[index] = value;
    setIngredients(newIngs);
  };
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

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
      for (const ingName of ingredients) {
        if (!ingName.trim()) continue;
        const { data: ingData } = await supabase
          .from('ingredients')
          .upsert({ name: ingName.trim().toLowerCase() }, { onConflict: 'name' })
          .select().single();

        if (ingData) {
          await supabase.from('recipe_ingredients').insert({
            recipe_id: recipe.id,
            ingredient_id: ingData.id,
            amount: '' 
          });
        }
      }

      setProgress(100);
      alert("Recipe Published! 🚀");
      
      // Reset
      setFormData({ title: '', description: '', cuisine: 'Dinner' });
      setIngredients(['']);
      setImagePreview(null);
      setVideoPreview(null);
      
    } catch (err) {
      alert(err.message);
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

        {/* --- NEW CATEGORY SELECT --- */}
        <div className="input-group">
          <label>Meal Type</label>
          <select 
            className="cuisine-select"
            value={formData.cuisine} 
            onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="ingredients-section">
          <label>Ingredients</label>
          {ingredients.map((ing, index) => (
            <div key={index} className="ingredient-row">
              <input type="text" value={ing} onChange={(e) => updateIngredient(index, e.target.value)} />
              <button type="button" onClick={() => removeIngredient(index)}>✕</button>
            </div>
          ))}
          <button type="button" className="add-ing-btn" onClick={addIngredient}>+ Add Ingredient</button>
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