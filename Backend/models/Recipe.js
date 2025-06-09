const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  prepTime: {
    type: String,
    required: [true, 'Preparation time is required'],
    trim: true
  },
  cookTime: {
    type: String,
    required: [true, 'Cooking time is required'],
    trim: true
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  method: {
    type: String,
    required: [true, 'Method is required'],
    trim: true
  },
  nutrition: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);
