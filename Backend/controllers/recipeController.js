const Recipe = require('../models/Recipe');

exports.updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    let {
      name,
      cookTime,
      chef,
      type,
      serves,
      prepTime,
      ingredients,
      method,
      nutrition,
      image,
      isPrivate,
    } = req.body;

    if (typeof ingredients === 'string') {
      try {
        ingredients = JSON.parse(ingredients);
      } catch {
        return res.status(400).json({ message: 'Invalid format for ingredients' });
      }
    }

    // Validate required fields
    if (
      !name?.trim() ||
      !cookTime?.trim() ||
      !type?.trim() ||
      !serves ||
      !prepTime?.trim() ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      ingredients.some(i => !i.trim()) ||
      !method?.trim()
    ) {
      return res.status(400).json({ message: 'Please provide all required fields with valid values.' });
    }

    const servingsNum = Number(serves);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number.' });
    }

    // Find the recipe and ensure the user owns it
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    if (recipe.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this recipe.' });
    }

    // Update fields
    recipe.title = name.trim();
    recipe.cookTime = cookTime.trim();
    recipe.chef = chef?.trim() || 'Unknown';
    recipe.category = type.trim();
    recipe.servings = servingsNum;
    recipe.prepTime = prepTime.trim();
    recipe.ingredients = ingredients.map(i => i.trim());
    recipe.method = method.trim();
    recipe.nutrition = nutrition?.trim() || '';
    recipe.image = image?.trim() || '/images/default-recipe.jpg';
    recipe.isPrivate = Boolean(isPrivate);

    await recipe.save();

    return res.status(200).json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(500).json({ message: 'Server error while updating recipe' });
  }
};
