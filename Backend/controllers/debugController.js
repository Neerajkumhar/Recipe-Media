const User = require('../models/User');

// DEBUG: List all users (for troubleshooting only, remove in production)
exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List all users except the current user
exports.listAllUsersExceptCurrent = async (req, res) => {
  try {
    // If user is authenticated, exclude them; else, just return all
    let excludeId = req.user ? req.user._id : null;
    let query = excludeId ? { _id: { $ne: excludeId } } : {};
    const users = await User.find(query).select('name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
