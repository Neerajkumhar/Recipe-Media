import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserType {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

const DiscoverPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch(`${API_BASE}/api/social/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user suggestions');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleAddFriend = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${API_BASE}/api/social/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send friend request');
      }

      // Remove user from suggestions after successful follow
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Discover People</h1>
        <p className="text-gray-600 mt-2">Find and connect with other food enthusiasts</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No suggestions available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for more connections!</p>
          </div>
        ) : (
          users.map(user => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>
              )}

              <button
                onClick={() => handleAddFriend(user._id)}
                className="w-full mt-2 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                Add Friend
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
