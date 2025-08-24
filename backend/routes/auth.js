const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/reset-password', auth, resetPassword);

module.exports = router;