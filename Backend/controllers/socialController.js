const User = require('../models/User');


users = await User.find({ _id: { $ne: req.user._id } })
  .select('name email')
  .limit(20);

await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: userId } });
await User.findByIdAndUpdate(userId, { $addToSet: { followers: req.user._id } });


// Search users by name or email (excluding self)
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    let users;
    if (!query) {
      users = await User.find({ _id: { $ne: req.user._id } }).select('name email');
    } else {
      users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      }).select('name email');
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself.' });
    }

    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user.' });
    }

    user.following.push(userId);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    res.json({ message: 'User followed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users you are following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name email');
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot unfollow yourself.' });
    }
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
    res.json({ message: 'User unfollowed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

