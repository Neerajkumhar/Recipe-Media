import React from 'react';
import { RouteObject } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import PrivateRoute from '../components/PrivateRoute';
import HomePage from '../pages/HomePage';
import RecipePage from '../pages/RecipePage';
import RecipeDetail from '../pages/RecipeDetail';
import MealPlanPage from '../pages/MealPlanPage';
import GroceryListPage from '../pages/GroceryListPage';
import DiscoverPage from '../pages/DiscoverPage';
import ProfilePage from '../pages/ProfilePage';
import SocialPage from '../pages/SocialPage';
import SigninPage from '../pages/SigninPage';
import SignupPage from '../pages/SignupPage';

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/recipes', element: <RecipePage /> },
          { path: '/recipes/:id', element: <RecipeDetail /> },
          { path: '/meal-plan', element: <MealPlanPage /> },
          { path: '/grocery-list', element: <GroceryListPage /> },
          { path: '/discover', element: <DiscoverPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/social', element: <SocialPage /> },
        ],
      },
      { path: '/signin', element: <SigninPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
];
