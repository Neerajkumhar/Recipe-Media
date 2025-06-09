const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/auth');

// Debug logging middleware for auth routes
router.use((req, res, next) => {
  console.log('Auth Route Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect, authController.profile);
router.get('/me', protect, authController.me);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
