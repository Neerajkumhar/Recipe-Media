// src/pages/RecipePage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import RecipeCard from '../components/RecipeCard';

interface Recipe {
  _id: string;
  title: string;
  category: string;
  image: string;
  prepTime: string;
  servings: number;
  cookTime: string;
  chef: string;
  ingredients: string[];
  method: string;
  nutrition: string;
  isPrivate?: boolean;
  user: string;
  createdBy: string;
}

interface RecipeFormData {
  title: string;
  cookTime: string;
  chef: string;
  category: string;
  serves: string;
  prepTime: string;
  ingredients: string[];
  method: string;
  nutrition: string;
  image: string;
  isPrivate: boolean;
}

const categories = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const RecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    cookTime: '',
    chef: '',
    category: '',
    serves: '',
    prepTime: '',
    ingredients: [''],
    method: '',
    nutrition: '',
    image: '',
    isPrivate: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showModal]);

  const handleAuthError = () => {
    localStorage.removeItem('token');
    setSubmitMessage('Authentication required. Please sign in.');
    navigate('/signin');
  };

  const fetchRecipes = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const res = await fetch(`${API_BASE}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error('Failed to fetch recipes');
      }

      const data = await res.json();
      // Map backend response to frontend model
      const mappedRecipes = data.map((recipe: any) => ({
        _id: recipe._id,
        title: recipe.title || recipe.name || '',
        category: recipe.category || recipe.type || 'Other',
        image: recipe.image || '',
        prepTime: recipe.prepTime || '',
        servings: recipe.servings || recipe.serves || 0,
        cookTime: recipe.cookTime || '',
        chef: recipe.chef || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        method: recipe.method || '',
        nutrition: recipe.nutrition || '',
        isPrivate: Boolean(recipe.isPrivate),
        user: recipe.user,
        createdBy: recipe.createdBy
      }));
      setAllRecipes(mappedRecipes);
    } catch (error: any) {
      setFetchError(error.message || 'Error fetching recipes');
      setAllRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = allRecipes.filter((recipe) => {
    if (!recipe || typeof recipe !== 'object') return false;
    
    // Ensure required fields exist with default values
    const title = recipe.title || '';
    const category = recipe.category || 'Other';
    
    const matchesSearch = !searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === 'ingredients' && typeof index === 'number') {
      const newIngredients = [...formData.ingredients];
      newIngredients[index] = value;
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.cookTime.trim() ||
      !formData.category.trim() ||
      !formData.serves.trim() ||
      !formData.prepTime.trim() ||
      !formData.method.trim() ||
      formData.ingredients.length === 0 ||
      formData.ingredients.some((i) => i.trim() === '')
    ) {
      alert('Please fill all required fields including all ingredient lines.');
      return;
    }

    setLoading(true);
    setSubmitMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      const cleanedIngredients = formData.ingredients.filter((i) => i.trim() !== '');

      const payload = {
        name: formData.title.trim(),
        cookTime: formData.cookTime.trim(),
        chef: formData.chef.trim() || 'Unknown',
        type: formData.category.trim(),
        serves: Number(formData.serves),
        prepTime: formData.prepTime.trim(),
        ingredients: cleanedIngredients,
        method: formData.method.trim(),
        nutrition: formData.nutrition.trim() || '',
        image: formData.image.trim() || '/images/default-recipe.jpg',
        isPrivate: formData.isPrivate,
      };

      const url =
        editMode && editId
          ? `${API_BASE}/api/recipes/${editId}`
          : `${API_BASE}/api/recipes`;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const err = await response.json();
        throw new Error(err.message || 'Failed to save recipe');
      }

      const responseData = await response.json();
      // Map backend response to frontend model
      const savedRecipe = {
        _id: responseData._id,
        title: responseData.title || responseData.name,
        category: responseData.category || responseData.type,
        image: responseData.image,
        prepTime: responseData.prepTime,
        servings: responseData.servings || responseData.serves,
        cookTime: responseData.cookTime,
        chef: responseData.chef,
        ingredients: responseData.ingredients,
        method: responseData.method,
        nutrition: responseData.nutrition,
        isPrivate: responseData.isPrivate
      };

      // Update the recipes list with the new/updated recipe
      if (editMode) {
        setAllRecipes(prev => prev.map(r => r._id === savedRecipe._id ? savedRecipe : r));
      } else {
        setAllRecipes(prev => [savedRecipe, ...prev]);
      }

      setSubmitMessage(editMode ? 'Recipe updated successfully!' : 'Recipe added successfully!');
      resetForm();
      setShowModal(false);
      setEditMode(false);
      setEditId(null);
    } catch (error: any) {
      setSubmitMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      cookTime: '',
      chef: '',
      category: '',
      serves: '',
      prepTime: '',
      ingredients: [''],
      method: '',
      nutrition: '',
      image: '',
      isPrivate: false,
    });
  };

  const handleEdit = (recipe: Recipe) => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleAuthError();
      return;
    }

    // Get user ID from token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    const recipeUserId = typeof recipe.user === 'object' ? recipe.user._id : recipe.user;
    
    if (String(recipeUserId) !== String(userId)) {
      setSubmitMessage('You can only edit your own recipes');
      return;
    }

    setFormData({
      title: recipe.title,
      cookTime: recipe.cookTime,
      chef: recipe.chef,
      category: recipe.category,
      serves: recipe.servings.toString(),
      prepTime: recipe.prepTime,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [''],
      method: recipe.method,
      nutrition: recipe.nutrition || '',
      image: recipe.image || '',
      isPrivate: Boolean(recipe.isPrivate),
    });
    setEditMode(true);
    setEditId(recipe._id);
    setShowModal(true);
    setSubmitMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    setLoading(true);
    setSubmitMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError();
        return;
      }

      // First check if the user owns this recipe
      const recipe = allRecipes.find(r => r._id === id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      // Get user ID from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      const recipeUserId = typeof recipe.user === 'object' ? recipe.user._id : recipe.user;

      if (String(recipeUserId) !== String(userId)) {
        throw new Error('You can only delete your own recipes');
      }

      const response = await fetch(`${API_BASE}/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete recipe');
      }

      await fetchRecipes();
      setSubmitMessage('Recipe deleted successfully!');
    } catch (error: any) {
      setSubmitMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading title="Recipes" />
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setEditId(null);
              setSubmitMessage(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
            aria-label="Open Create Recipe Modal"
          >
            Create Recipe
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label="Search recipes"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
              aria-hidden="true"
            />
          </div>
          <div className="relative md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 pl-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label="Filter recipes by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
              aria-hidden="true"
            />
          </div>
        </div>

        {fetchError && <p className="text-red-600 text-center mb-6">{fetchError}</p>}

        {loading ? (
          <p className="text-center mt-6">Loading recipes...</p>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  id={recipe._id}
                  title={recipe.title}
                  category={recipe.category}
                  image={recipe.image}
                  prepTime={recipe.prepTime}
                  servings={recipe.servings}
                  isPrivate={recipe.isPrivate}
                  onEdit={() => handleEdit(recipe)}
                  onDelete={() => handleDelete(recipe._id)}
                />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No recipes found.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 btn btn-primary"
              aria-label="Clear search filters"
            >
              Clear Filters
            </button>
          </div>
        )}

        {submitMessage && (
          <div className="mt-6 text-center text-green-600 font-semibold" role="alert">
            {submitMessage}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-recipe-title"
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 id="create-recipe-title" className="text-3xl font-semibold text-gray-800">
                {editMode ? 'Edit Recipe' : 'Create New Recipe'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setEditMode(false);
                  setEditId(null);
                  setSubmitMessage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Recipe Name*</label>
                  <input
                    id="title"
                    ref={firstInputRef}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Chocolate Chip Cookies"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-required="true"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="chef" className="block text-sm font-medium text-gray-700">Chef Name</label>
                  <input
                    id="chef"
                    name="chef"
                    value={formData.chef}
                    onChange={handleChange}
                    placeholder="Your name (optional)"
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="serves" className="block text-sm font-medium text-gray-700">Servings*</label>
                  <input
                    id="serves"
                    name="serves"
                    type="number"
                    value={formData.serves}
                    onChange={handleChange}
                    placeholder="Number of servings"
                    required
                    min={1}
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Prep Time*</label>
                  <input
                    id="prepTime"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    placeholder="e.g. 20 minutes"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700">Cook Time*</label>
                  <input
                    id="cookTime"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    placeholder="e.g. 30 minutes"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ingredients*</label>
                <div className="space-y-3">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        name="ingredients"
                        value={ingredient}
                        onChange={(e) => handleChange(e, index)}
                        className="flex-grow border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. 2 cups all-purpose flour"
                        required={index === 0}
                        aria-required={index === 0}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          aria-label={`Remove ingredient ${index + 1}`}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Ingredient
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="method" className="block text-sm font-medium text-gray-700">Cooking Instructions*</label>
                <textarea
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  placeholder="Step-by-step cooking instructions..."
                  required
                  className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={6}
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nutrition" className="block text-sm font-medium text-gray-700">Nutrition Information</label>
                <textarea
                  id="nutrition"
                  name="nutrition"
                  value={formData.nutrition}
                  onChange={handleChange}
                  placeholder="Calories, protein, carbs, etc. (optional)"
                  className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Recipe Image URL</label>
                <input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg (optional)"
                  className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  Make this recipe private (only visible to you)
                </label>
              </div>

              <div className="flex justify-end items-center gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditMode(false);
                    setEditId(null);
                    setSubmitMessage(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editMode ? 'Update Recipe' : 'Create Recipe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipePage;
