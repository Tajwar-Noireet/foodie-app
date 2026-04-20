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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: []
  });

  useEffect(() => {
    // Fetch the existing recipe data when the screen loads
    const loadRecipe = async () => {
      const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          cuisine: data.cuisine || []
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

    const { error } = await supabase
      .from('recipes')
      .update({
        title: formData.title,
        description: formData.description,
        cuisine: formData.cuisine
      })
      .eq('id', id);

    setSaving(false);
    if (error) {
      toast.error(error.message); // 2. Replace alert()
    } else {
      toast.success("Recipe updated successfully!"); // 3. Replace alert()
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
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>

        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? 'Saving Changes...' : 'Update Recipe'}
        </button>
      </form>
    </div>
  );
};

export default EditScreen;