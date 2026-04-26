import { supabase } from './supabaseClient';

export const fetchUserSavedMenu = async (userId) => {
  try {
    
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

    
    const savedRecipes = data.map(item => item.recipes);

    
    const allIngredients = savedRecipes.flatMap(recipe => recipe.recipe_ingredients);
    
    const deduplicatedIngredients = allIngredients.reduce((acc, curr) => {
      
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