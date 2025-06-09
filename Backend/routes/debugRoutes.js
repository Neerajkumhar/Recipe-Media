const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');
const protect = require('../middleware/auth');

// DEBUG: List all users (authenticated, exclude self)
router.get('/users', protect, debugController.listAllUsers);

module.exports = router;
