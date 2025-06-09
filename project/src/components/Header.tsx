import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; imageUrl?: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!res.ok) {
        // Try alternative endpoint if first one fails
        const altRes = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (!altRes.ok) throw new Error('Failed to fetch profile');
        const data = await altRes.json();
        setUser(data);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setUser(null);
      if (error.message === 'Invalid token') {
        localStorage.removeItem('token');
        navigate('/signin');
      }
    }
  };

  // Update event listener to handle the custom event with user data
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      if (event.detail) {
        setUser(event.detail);
      } else {
        refreshUserData();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // Replace the existing user fetch effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      refreshUserData();
    } else {
      setUser(null);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowProfile((prev) => !prev);
    } else {
      navigate('/signin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setShowProfile(false);
    navigate('/signin');
  };

  const token = localStorage.getItem('token');

  // If not authenticated, don't render header
  if (!token) {
    return null;
  }

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-900 shadow-md' : 'bg-dark-900/95'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-white font-bold text-2xl">
            mogo
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block w-full max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipe"
                className="w-full py-2 pl-10 pr-4 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </button>
            <div
              className="h-8 w-8 rounded-full bg-cover bg-center cursor-pointer border-2 border-accent-500 overflow-hidden"
              onClick={() => navigate('/profile')}
              title={user ? user.name : 'Profile'}
            >
              <img 
                src={user?.imageUrl || 'https://via.placeholder.com/150'} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Logout button next to profile */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            )}
            {showProfile && isAuthenticated && (
              <div className="absolute right-4 top-14 w-56 bg-white rounded-lg shadow-lg z-50 p-4 text-dark-900">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={user?.imageUrl || 'https://via.placeholder.com/150'} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md mb-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
            {!isAuthenticated && (
              <button
                className="ml-2 px-3 py-1 rounded bg-accent-500 text-white hover:bg-accent-600"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipe"
              className="w-full py-2 pl-10 pr-4 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="mt-4 pb-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <NavLink 
                to="/" 
                className={({isActive}) => `text-white px-3 py-2 rounded-md ${isActive ? 'bg-dark-700' : 'hover:bg-dark-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/recipes" 
                className={({isActive}) => `text-white px-3 py-2 rounded-md ${isActive ? 'bg-dark-700' : 'hover:bg-dark-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Recipes
              </NavLink>
              <NavLink 
                to="/meal-plan" 
                className={({isActive}) => `text-white px-3 py-2 rounded-md ${isActive ? 'bg-dark-700' : 'hover:bg-dark-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Meal Plan
              </NavLink>
              <NavLink 
                to="/grocery-list" 
                className={({isActive}) => `text-white px-3 py-2 rounded-md ${isActive ? 'bg-dark-700' : 'hover:bg-dark-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Grocery List
              </NavLink>
              <NavLink 
                to="/discover" 
                className={({isActive}) => `text-white px-3 py-2 rounded-md ${isActive ? 'bg-dark-700' : 'hover:bg-dark-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Discover
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;