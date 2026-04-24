import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const EditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = ["Breakfast", "Lunch", "Dinner", "Main Course", "Dessert", "Vegan", "Snack", "Drink", "Appetizer"];

  // 1. ADDED the missing fields to initial state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: [],
    image: '',
    video: '',
    dietary_tag: ''
  });

  useEffect(() => {
    // Fetch the existing recipe data when the screen loads
    const loadRecipe = async () => {
      const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
      if (data) {
        // 2. ADDED the missing fields here so they load from the database
        setFormData({
          title: data.title || '',
          description: data.description || '',
          cuisine: data.cuisine || [],
          image: data.image || '',
          video: data.video || '',
          dietary_tag: data.dietary_tag || ''
        });
      }
      setLoading(false);
    };
    loadRecipe();
  }, [id]);

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const currentList = prev.cuisine || [];
      return currentList.includes(cat) 
        ? { ...prev, cuisine: currentList.filter(c => c !== cat) }
        : { ...prev, cuisine: [...currentList, cat] };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    // 3. ADDED the missing fields to the update payload
    const { error } = await supabase
      .from('recipes')
      .update({
        title: formData.title,
        description: formData.description,
        cuisine: formData.cuisine,
        image: formData.image,
        video: formData.video,
        dietary_tag: formData.dietary_tag
      })
      .eq('id', id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Recipe updated successfully!");
      navigate(`/recipe/${id}`); 
    }
  };

  if (loading) return <div>Loading recipe data...</div>;

  return (
    <div className="create-container">
      <h1 className="feed-title">Edit Recipe</h1>
      <form className="create-form" onSubmit={handleUpdate}>
        
        <div className="input-group">
          <label>Title</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>

        {/* ADDED: Image URL Input */}
        <div className="input-group">
          <label>Image URL</label>
          <input 
            type="text" 
            placeholder="https://..."
            value={formData.image} 
            onChange={(e) => setFormData({...formData, image: e.target.value})} 
          />
        </div>

        {/* ADDED: Video URL Input */}
        <div className="input-group">
          <label>Video URL (Optional)</label>
          <input 
            type="text" 
            placeholder="https://..."
            value={formData.video} 
            onChange={(e) => setFormData({...formData, video: e.target.value})} 
          />
        </div>

        {/* ADDED: Dietary Tag Dropdown */}
        <div className="input-group">
          <label>Dietary Tag</label>
          <select 
            value={formData.dietary_tag} 
            onChange={(e) => setFormData({...formData, dietary_tag: e.target.value})}
            className="dietary-select"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px' }}
          >
            <option value="">None</option>
            <option value="Vegan">Vegan</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
            <option value="Halal">Halal</option>
            <option value="Kosher">Kosher</option>
          </select>
        </div>

        <div className="input-group">
          <label>Meal Types</label>
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

        <div className="input-group">
          <label>Instructions</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows={5}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? 'Saving Changes...' : 'Update Recipe'}
        </button>
      </form>
    </div>
  );
};

export default EditScreen;