// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecipePage from './pages/RecipePage';
import RecipeDetail from './pages/RecipeDetail'; // recipe detail page
import MealPlanPage from './pages/MealPlanPage';
import GroceryListPage from './pages/GroceryListPage';
import DiscoverPage from './pages/DiscoverPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import { GroceryListProvider } from './contexts/GroceryListContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { replace: true, state: { from: location } });
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          localStorage.removeItem('token');
          navigate('/signin', { replace: true, state: { from: location } });
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        localStorage.removeItem('token');
        navigate('/signin', { replace: true, state: { from: location } });
      }
    };
    validateAuth();
  }, [location, navigate]);
  return children;
}

function App() {
  return (
    <GroceryListProvider>
      <Routes>
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path="recipes" element={<RecipePage />} />
          <Route path="recipedetail/:id" element={<RecipeDetail />} />
          <Route path="meal-plan" element={<MealPlanPage />} />
          <Route path="grocery-list" element={<GroceryListPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="social" element={<SocialPage />} />
        </Route>
        {/* These routes are outside the Layout and don't require auth */}
        <Route path="signup" element={<SignupPage />} />
        <Route path="signin" element={<SigninPage />} />
        {/* Catch all other routes and redirect to signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </GroceryListProvider>
  );
}

export default App;
