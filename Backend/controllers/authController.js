const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { 
      email: req.body.email,
      headers: req.headers
    });
    
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    console.log('Login successful:', { userId: user._id, email: user.email });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('Update Profile Request:', {
      userId: req.user.id,
      body: req.body
    });
    
    const { name, imageUrl } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found.' });
    }

    user.name = name || user.name;
    user.imageUrl = imageUrl || user.imageUrl;

    const updatedUser = await user.save();
    console.log('Profile updated successfully:', {
      id: updatedUser._id,
      name: updatedUser.name
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      imageUrl: updatedUser.imageUrl
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    user.imageUrl = imageUrl;
    await user.save();

    console.log('Profile image updated successfully:', {
      userId: user._id,
      imageUrl: imageUrl
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl
    });
  } catch (err) {
    console.error('Profile image update error:', err);
    res.status(500).json({ message: 'Failed to update profile image.' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
