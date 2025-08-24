const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { getAnalytics, getUserAnalytics } = require('../controllers/analyticsController');

// All routes require authentication
router.use(auth);

// Get comprehensive analytics (admin only)
router.get('/', adminOnly, getAnalytics);

// Get user-specific analytics
router.get('/user/:userId?', getUserAnalytics);

module.exports = router; 