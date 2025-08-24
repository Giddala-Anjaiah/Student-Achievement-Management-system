const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const {
  getTopAchievers,
  getCategoryLeaders,
  getLeaderboardStats
} = require('../controllers/leaderboardController');

// Public routes (optional auth for personalized data)
router.get('/top', optionalAuth, getTopAchievers);
router.get('/category/:category', optionalAuth, getCategoryLeaders);
router.get('/stats', optionalAuth, getLeaderboardStats);

module.exports = router;
