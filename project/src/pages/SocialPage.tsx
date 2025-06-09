import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UserType {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

const SocialPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [following, setFollowing] = useState<UserType[]>([]);
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null); // userId loading
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const headers = { Authorization: `Bearer ${token}` };

      const [suggestionsRes, followingRes] = await Promise.all([
        axios.get('/api/users/suggestions', { headers }),
        axios.get('/api/social/following', { headers }),
      ]);

      setSuggestions(suggestionsRes.data || []);
      setFollowing(followingRes.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error loading users';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    setLoadingFollow(userId);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      await axios.post(`/api/social/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('Followed successfully!');

      // Optimistically update UI:
      // Remove user from suggestions
      const followedUser = suggestions.find(u => u._id === userId);
      if (followedUser) {
        setSuggestions(suggestions.filter(u => u._id !== userId));
        setFollowing([...following, followedUser]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not follow user.';
      setMessage(msg);
    } finally {
      setLoadingFollow(null);
    }
  };

  const isFollowing = (userId: string) => following.some(f => f._id === userId);

  // Filter suggestions by search input
  const filteredSuggestions = suggestions.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderUserCard = (user: UserType) => (
    <li
      key={user._id}
      className="flex items-center bg-accent-50 rounded p-3 shadow-sm justify-between"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-accent-200 flex items-center justify-center text-xl font-bold text-accent-700 mr-3">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-dark-700">{user.name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
      <button
        className={`px-4 py-1 rounded shadow-sm transition ${
          isFollowing(user._id) || loadingFollow === user._id
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        onClick={() => !isFollowing(user._id) && loadingFollow !== user._id && handleFollow(user._id)}
        disabled={isFollowing(user._id) || loadingFollow === user._id}
      >
        {loadingFollow === user._id
          ? 'Following...'
          : isFollowing(user._id)
          ? 'Following'
          : 'Follow Him'}
      </button>
    </li>
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-accent-500">Social - Follow Users</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name or email"
          className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-accent-500">Suggested Users</h2>
        {loading ? (
          <div>Loading...</div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-gray-500">No suggestions available.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSuggestions.map(user => renderUserCard(user))}
          </ul>
        )}
        {message && <div className="mt-4 text-center text-red-500">{message}</div>}
      </div>
    </div>
  );
};

export default SocialPage;
