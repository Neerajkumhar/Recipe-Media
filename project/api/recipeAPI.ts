// src/api/recipeApi.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/recipes';

// Helper to get auth headers
const getAuthHeaders = (contentType = 'application/json') => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': contentType,
    Authorization: `Bearer ${token}`,
  };
};

// Create a new recipe with form data (including optional image)
export const createRecipe = async (formData: FormData) => {
  try {
    const response = await axios.post(API_BASE_URL, formData, {
      headers: {
        ...getAuthHeaders('multipart/form-data'),
      },
    });
    return response.data;  // { message: 'Recipe created successfully', recipe: {...} }
  } catch (error: any) {
    // Throw error with message for UI handling
    throw error.response?.data || { error: 'Failed to create recipe' };
  }
};

// Fetch all recipes for the logged-in user only
export const fetchUserRecipes = async () => {
  try {
    const response = await axios.get(API_BASE_URL, {
      headers: getAuthHeaders(),
    });
    return response.data; // Only recipes for the logged-in user
  } catch (error: any) {
    throw error.response?.data || { error: 'Failed to fetch recipes' };
  }
};

// Get a single recipe (only if owned by current user)
export const getRecipe = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Failed to fetch recipe' };
  }
};

// Update a recipe (only if owned by current user)
export const updateRecipe = async (id: string, formData: FormData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeaders('multipart/form-data'),
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Failed to update recipe' };
  }
};

// Delete a recipe (only if owned by current user)
export const deleteRecipe = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Failed to delete recipe' };
  }
};
