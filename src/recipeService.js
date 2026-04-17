import { supabase } from './supabaseClient';

export const fetchUserSavedMenu = async (userId) => {
  try {
    // 1. Fetch the user's saved recipes and nested ingredients
    const { data, error } = await supabase
      .from('saved_recipes')
      .select(`
        recipe_id,
        recipes (
          id,
          title,
          image_url,
          recipe_ingredients (
            amount,
            ingredients (
              name
            )
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // 2. Extract just the recipes from the nested response
    const savedRecipes = data.map(item => item.recipes);

    // 3. The Deduplication Engine 
    const allIngredients = savedRecipes.flatMap(recipe => recipe.recipe_ingredients);
    
    const deduplicatedIngredients = allIngredients.reduce((acc, curr) => {
      // Safety check in case a recipe has no ingredients attached
      if (!curr || !curr.ingredients) return acc; 
      
      const ingredientName = curr.ingredients.name;
      
      if (!acc[ingredientName]) {
        acc[ingredientName] = {
          name: ingredientName,
          amounts: [curr.amount] 
        };
      } else {
        acc[ingredientName].amounts.push(curr.amount);
      }
      return acc;
    }, {});

    // Convert the object back into an array for easy React mapping
    const finalIngredientsList = Object.values(deduplicatedIngredients);

    return {
      recipes: savedRecipes,
      shoppingList: finalIngredientsList
    };
    
  } catch (err) {
    console.error("Database fetch error:", err.message);
    return null;
  }
};