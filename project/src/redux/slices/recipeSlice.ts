// src/redux/slices/recipeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the type for a Recipe (adjust fields as per your backend model)
interface Recipe {
  _id: string;
  title: string;
  cookTime: string;
  chef: string;
  category: string;
  servings: number;
  prepTime: string;
  ingredients: string[];
  method: string;
  nutrition?: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
  user: string; // Add user field to track recipe owner
  isPrivate: boolean; // Make isPrivate required
}

// Define the slice state
interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:5000/api/recipes';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No auth token found');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Add type guards
const isValidRecipe = (recipe: any): recipe is Recipe => {
  return (
    typeof recipe === 'object' &&
    typeof recipe._id === 'string' &&
    typeof recipe.title === 'string' &&
    typeof recipe.isPrivate === 'boolean' &&
    typeof recipe.user === 'string'
  );
};

// Async thunk to post new recipe to backend
export const createRecipe = createAsyncThunk<Recipe, Partial<Recipe>, { rejectValue: string }>(
  'recipes/createRecipe',
  async (recipeData, { rejectWithValue }) => {
    try {
      const response = await axios.post<Recipe>(API_BASE_URL, 
        { ...recipeData, isPrivate: Boolean(recipeData.isPrivate) },
        { headers: getAuthHeaders() }
      );
      
      if (!isValidRecipe(response.data)) {
        throw new Error('Invalid recipe data received from server');
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create recipe');
    }
  }
);

// Async thunk to fetch user's recipes
export const fetchUserRecipes = createAsyncThunk<Recipe[], void, { rejectValue: string }>(
  'recipes/fetchUserRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Recipe[]>>('/api/recipes');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recipes');
    }
  }
);

// Async thunk to update recipe
export const updateRecipe = createAsyncThunk<Recipe, { id: string; data: any }, { rejectValue: string }>(
  'recipes/updateRecipe',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.recipe as Recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update recipe');
    }
  }
);

// Async thunk to delete recipe
export const deleteRecipe = createAsyncThunk<string, string, { rejectValue: string }>(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete recipe');
    }
  }
);

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearRecipes: (state) => {
      state.recipes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Recipe
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes.unshift(action.payload);
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create recipe';
      })
      // Fetch Recipes
      .addCase(fetchUserRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch recipes';
      })
      // Update Recipe
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.recipes.findIndex(recipe => recipe._id === action.payload._id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
      })
      // Delete Recipe
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter(recipe => recipe._id !== action.payload);
      });
  },
});

export const { clearRecipes } = recipeSlice.actions;
export default recipeSlice.reducer;
