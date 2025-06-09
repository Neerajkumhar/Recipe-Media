const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure the uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Debug logging middleware for recipe routes
router.use((req, res, next) => {
  console.log('\n=== Recipe Route Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Headers:', {
    ...req.headers,
    authorization: req.headers.authorization ? 'Bearer [hidden]' : undefined
  });
  console.log('User:', req.user ? { id: req.user._id } : 'No user');
  console.log('=========================\n');
  next();
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * GET all recipes
 */
router.get('/', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({
      $or: [
        { isPrivate: { $ne: true } },
        { isPrivate: true, user: req.user._id }
      ]
    }).populate('user', '_id').lean();

    const filtered = recipes.filter(r => !r.isPrivate || (r.user && r.user._id.toString() === req.user._id.toString()));
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

/**
 * GET a single recipe by ID
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const recipeId = req.params.id;

    if (!recipeId || !recipeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    if (recipe.isPrivate && recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to private recipe.' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe', error: error.message });
  }
});

/**
 * POST create a recipe
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name, cookTime, chef, type, serves,
      prepTime, ingredients, method, nutrition
    } = req.body;

    if (!name?.trim() || !cookTime?.trim() || !type?.trim() || !serves || !prepTime?.trim() || !method?.trim() || !ingredients) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let parsedIngredients = [];
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
        if (!Array.isArray(parsedIngredients) || parsedIngredients.some(i => typeof i !== 'string' || !i.trim())) {
          return res.status(400).json({ message: 'Ingredients must be an array of non-empty strings.' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Ingredients format is invalid.', error: err.message });
      }
    } else if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    } else {
      return res.status(400).json({ message: 'Ingredients must be provided as an array.' });
    }

    const servingsNum = Number(serves);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number.' });
    }

    let imagePath = '/images/default-recipe.jpg';
    if (req.body.image?.trim()) imagePath = req.body.image.trim();
    else if (req.file) imagePath = `/uploads/${req.file.filename}`;

    const newRecipe = new Recipe({
      title: name.trim(),
      cookTime: cookTime.trim(),
      chef: chef?.trim() || 'Unknown',
      category: type.trim(),
      servings: servingsNum,
      prepTime: prepTime.trim(),
      ingredients: parsedIngredients.map(i => i.trim()),
      method: method.trim(),
      nutrition: nutrition?.trim() || '',
      image: imagePath,
      user: userId,
      createdBy: userId
    });

    await newRecipe.save();
    res.status(201).json({ message: 'Recipe created successfully', recipe: newRecipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

/**
 * PUT update recipe by ID
 */
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const {
      name, cookTime, chef, type, serves,
      prepTime, ingredients, method, nutrition
    } = req.body;

    let parsedIngredients = [];
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
        if (!Array.isArray(parsedIngredients) || parsedIngredients.some(i => typeof i !== 'string' || !i.trim())) {
          return res.status(400).json({ message: 'Ingredients must be an array of non-empty strings.' });
        }
      } catch {
        return res.status(400).json({ message: 'Invalid ingredients format.' });
      }
    } else if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    }

    const servingsNum = Number(serves);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      return res.status(400).json({ message: 'Servings must be a positive number.' });
    }

    let imagePath = recipe.image;
    if (req.body.image?.trim()) imagePath = req.body.image.trim();
    else if (req.file) imagePath = `/uploads/${req.file.filename}`;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        title: name?.trim(),
        cookTime: cookTime?.trim(),
        chef: chef?.trim() || 'Unknown',
        category: type?.trim(),
        servings: servingsNum,
        prepTime: prepTime?.trim(),
        ingredients: parsedIngredients.map(i => i.trim()),
        method: method?.trim(),
        nutrition: nutrition?.trim() || '',
        image: imagePath,
      },
      { new: true }
    );

    res.json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

/**
 * DELETE a recipe by ID
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted successfully', recipe });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
});

module.exports = router;
