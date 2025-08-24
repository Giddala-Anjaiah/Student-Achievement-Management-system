const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { searchAchievements, getSearchSuggestions, getFilterOptions } = require('../controllers/searchController');

// All routes require authentication
router.use(auth);

// Advanced search
router.get('/achievements', searchAchievements);

// Get search suggestions
router.get('/suggestions', getSearchSuggestions);

// Get filter options
router.get('/filters', getFilterOptions);

module.exports = router; 