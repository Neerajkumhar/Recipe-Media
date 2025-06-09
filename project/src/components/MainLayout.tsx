import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GroceryListProvider } from '../context/GroceryListContext';
import NavigationTabs from './NavigationTabs';
import Header from './Header';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {token && !isAuthPage && <NavigationTabs />}
      <main className="flex-grow">
        <GroceryListProvider>
          <Outlet />
        </GroceryListProvider>
      </main>
    </div>
  );
};

export default MainLayout;
