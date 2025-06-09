const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // your auth middleware
const User = require('../models/User');

// Get user suggestions excluding self, friends, and friendRequests
router.get('/suggestions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure friends and friendRequests are arrays (default empty arrays)
    const friends = Array.isArray(user.friends) ? user.friends : [];
    const friendRequests = Array.isArray(user.friendRequests) ? user.friendRequests : [];

    const excludeIds = [user._id, ...friends, ...friendRequests];

    const suggestions = await User.find({
      _id: { $nin: excludeIds }
    })
      .select('name email avatar bio')
      .limit(15);

    res.json(suggestions);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
});

// Send friend request
router.post('/add', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const senderId = req.user._id;

    const recipient = await User.findById(friendId);
    const sender = await User.findById(senderId);

    if (!recipient) return res.status(404).json({ message: 'User not found' });

    if (recipient.friendRequests.includes(senderId) || recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: 'Already sent or already friends' });
    }

    recipient.friendRequests.push(senderId);
    await recipient.save();

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    const requesterId = req.params.requestId;
    const user = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (!requester) return res.status(404).json({ message: 'Requester not found' });

    // Remove from pending friendRequests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

    // Add to friends list (if not already friends)
    if (!user.friends.includes(requester._id)) user.friends.push(requester._id);
    if (!requester.friends.includes(user._id)) requester.friends.push(user._id);

    await Promise.all([user.save(), requester.save()]);
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
});

// Decline friend request
router.post('/decline/:requestId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== req.params.requestId);
    await user.save();
    res.json({ message: 'Friend request declined' });
  } catch (err) {
    console.error('Error declining request:', err);
    res.status(500).json({ message: 'Failed to decline request' });
  }
});

// Get incoming friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', 'name email avatar bio');
    res.json(user.friendRequests);
  } catch (err) {
    console.error('Error getting friend requests:', err);
    res.status(500).json({ message: 'Failed to get friend requests' });
  }
});

// Get friends list
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email avatar bio');
    res.json(user.friends);
  } catch (err) {
    console.error('Error getting friends:', err);
    res.status(500).json({ message: 'Failed to get friends' });
  }
});

module.exports = router;
