import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CalendarDays, ShoppingCart, ChefHat, Search } from 'lucide-react';

const NavigationTabs: React.FC = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // If not authenticated, don't render navigation
  if (!token) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white shadow-sm sticky top-[72px] z-40">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          <NavLink 
            to="/meal-plan" 
            className={({ isActive }) => 
              `flex items-center py-4 px-5 border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-accent-500 text-accent-500 font-medium' 
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-200'
              }`
            }
          >
            <CalendarDays size={20} className="mr-2" />
            <span>Meal Plan</span>
          </NavLink>
          
          <NavLink 
            to="/grocery-list" 
            className={({ isActive }) => 
              `flex items-center py-4 px-5 border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-accent-500 text-accent-500 font-medium' 
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-200'
              }`
            }
          >
            <ShoppingCart size={20} className="mr-2" />
            <span>Grocery List</span>
          </NavLink>
          
          <NavLink 
            to="/recipes" 
            className={({ isActive }) => 
              `flex items-center py-4 px-5 border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-accent-500 text-accent-500 font-medium' 
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-200'
              }`
            }
          >
            <ChefHat size={20} className="mr-2" />
            <span>Recipes</span>
          </NavLink>
          
          <NavLink 
            to="/discover" 
            className={({ isActive }) => 
              `flex items-center py-4 px-5 border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-accent-500 text-accent-500 font-medium' 
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-200'
              }`
            }
          >
            <Search size={20} className="mr-2" />
            <span>Discover</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;