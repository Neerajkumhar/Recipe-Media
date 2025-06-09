import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface User {
  _id?: string;
  name: string;
  email: string;
  imageUrl?: string;
  followersCount?: number;
  followingCount?: number;
}

interface Recipe {
  _id: string;
  title: string;
  image: string;
  cookTime: string;
  prepTime: string;
  category: string;
  user?: { _id: string } | string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all-recipes');
  const navigate = useNavigate();

  // Fetch user profile once on mount and then start polling for followers/following counts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Initial profile fetch
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch profile');
        }

        const data = await res.json();
        setUser(data);
        setImageUrl(data.imageUrl || '');
        setUserId(data._id || null);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    fetchProfile();

    // Polling followers and following count every 5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile/follow-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch follower stats');
        const data = await res.json();
        setUser((prevUser) => prevUser ? { ...prevUser, ...data } : null);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Fetch user's recipes after userId is set
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    const fetchRecipes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/recipes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch recipes');
        }

        const data = await res.json();
        const filtered = data.filter(
          (r: any) => r.user && (r.user._id === userId || r.user === userId)
        );
        setRecipes(filtered);
      } catch (err) {
        setError('Failed to load recipes. Please try refreshing the page.');
      }
    };

    fetchRecipes();
  }, [userId]);

  useEffect(() => {
    if (user) {
      setImageUrl(user.imageUrl || '');
    }
  }, [user]);

  const handleProfileUpdate = async (newName: string, newImageUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          imageUrl: newImageUrl || '/default-avatar.png',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setUser(data);
      setImageUrl(data.imageUrl || '');
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipedetail/${recipeId}`);
  };

  const tabs = [
    { id: 'all-recipes', label: 'All Recipes' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'shared', label: 'Shared' },
    { id: 'liked', label: 'Liked' },
    { id: 'saved', label: 'Saved' },
  ];

  const filteredRecipes = recipes.filter((recipe) => {
    switch (activeTab) {
      case 'all-recipes':
        return true;
      case 'desserts':
        return recipe.category.toLowerCase() === 'desserts';
      case 'shared':
      case 'liked':
      case 'saved':
        return true; // Add logic as needed
      default:
        return true;
    }
  });

  if (error)
    return (
      <div className="text-center mt-10 text-red-600" role="alert">
        {error}
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={imageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div
                onClick={() => setShowEditModal(true)}
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <div className="p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{user?.name}</h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Edit Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate('/recipes?action=create')}
              className="px-4 py-2 bg-accent-600 text-white rounded-full hover:bg-accent-700"
            >
              Create Recipe
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="flex items-center gap-8 mt-6">
          <div className="text-center">
            <span className="block font-semibold">{recipes.length}</span>
            <span className="text-gray-600">Recipes</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold">
              {user.followingCount !== undefined ? user.followingCount : '...'}
            </span>
            <span className="text-gray-600">Following</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold">
              {user.followersCount !== undefined ? user.followersCount : '...'}
            </span>
            <span className="text-gray-600">Followers</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-accent-600 text-accent-700 font-semibold'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredRecipes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No recipes yet. Start creating your culinary masterpieces!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => handleRecipeClick(recipe._id)}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleRecipeClick(recipe._id);
                  }
                }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={recipe.image || '/default-recipe.jpg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-sm">{recipe.title}</h3>
                  <p className="text-gray-500 text-sm">{recipe.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleProfileUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
};

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-10 w-10 text-accent-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Loading"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

const EditProfileModal: React.FC<{
  show: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (name: string, imageUrl: string) => void;
  isLoading: boolean;
}> = ({ show, onClose, user, onSave, isLoading }) => {
  const [name, setName] = useState(user?.name || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setName(user?.name || '');
    setImageUrl(user?.imageUrl || '');
    setImageError(false);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, imageUrl);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 id="edit-profile-title" className="text-xl font-semibold mb-4">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-accent-500 focus:ring-accent-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageError(false);
              }}
              placeholder="https://example.com/image.jpg"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-accent-500 focus:ring-accent-500"
            />
            {imageUrl && !imageError && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!imageError) {
                      setImageError(true);
                      img.src = '/default-avatar.png';
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
