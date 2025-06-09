import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Users, ChefHat, ShoppingCart } from 'lucide-react';
import { useGroceryList } from '../contexts/GroceryListContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useGroceryList();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/recipes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!recipe) {
    return <div className="flex justify-center items-center min-h-screen">Recipe not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft size={20} />
        <span>Back to Recipes</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-[300px] object-cover"
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>            <button
              onClick={() => {
                recipe.ingredients.forEach((ingredient: string) => {
                  addItem(ingredient, '');
                });
                navigate('/grocery-list');
              }}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              title="Add ingredients to grocery list"
            >
              <ShoppingCart size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" size={20} />
              <span>Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" size={20} />
              <span>Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={20} />
              <span>Serves: {recipe.servings}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="text-gray-400" size={20} />
              <span>By: {recipe.chef}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Method</h2>
            <div className="prose max-w-none">
              {recipe.method.split('\n').map((step: string, index: number) => (
                <p key={index} className="mb-4">{step}</p>
              ))}
            </div>
          </div>

          {recipe.nutrition && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Nutrition Information</h2>
              <p className="text-gray-700">{recipe.nutrition}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
