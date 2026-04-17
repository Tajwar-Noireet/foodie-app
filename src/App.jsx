import { useState, useEffect } from 'react';
import { fetchUserSavedMenu } from './recipeService';
import './App.css'; // Optional: Keeps basic styling

function App() {
  // 1. Set up our UI State (The "Brain" of the component)
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. The API Call (Runs once when the page loads)
  useEffect(() => {
    const loadData = async () => {
      // CRITICAL: Since we don't have a login screen yet, we need to hardcode a User ID here to test!
      // We will replace this with the real logged-in user's ID later.
      const testUserId = '40e198c0-84e6-46f7-bf4c-3962c749316e'; 
      
      const data = await fetchUserSavedMenu(testUserId);
      
      if (data) {
        setRecipes(data.recipes);
        setIngredients(data.shoppingList);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // 3. The Loading Screen
  if (loading) {
    return <div>Loading your kitchen...</div>;
  }

  // 4. The Render (What the user actually sees)
  return (
    <div className="app-container">
      <h1>My Saved Menu</h1>

      <div className="dashboard-grid">
        {/* Left Side: The Recipes */}
        <section className="recipe-section">
          <h2>Recipes to Cook</h2>
          {recipes.length === 0 ? <p>No recipes saved yet!</p> : null}
          
          <ul>
            {recipes.map(recipe => (
              <li key={recipe.id}>
                <strong>{recipe.title}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Side: The Deduplicated Shopping List */}
        <section className="shopping-list-section">
          <h2>Master Shopping List</h2>
          <ul>
            {ingredients.map((item, index) => (
              <li key={index}>
                {item.name} - {item.amounts.join(' + ')}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;