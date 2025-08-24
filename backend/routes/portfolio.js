const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const {
  generatePortfolio,
  exportPDF
} = require('../controllers/portfolioController');

// All routes require authentication
router.use(auth);

router.get('/:userId?', generatePortfolio);
router.get('/:userId/export', exportPDF);

module.exports = router;
