import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import NavigationTabs from './NavigationTabs';
import { GroceryProvider } from '../contexts/GroceryContext';

const Layout: React.FC = () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <GroceryProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <NavigationTabs />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </GroceryProvider>
  );
};

export default Layout;