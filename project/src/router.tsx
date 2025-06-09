import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipePage from './pages/RecipePage';
import GroceryListPage from './pages/GroceryListPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';

function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RecipePage />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route path="/grocery-list" element={<GroceryListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;