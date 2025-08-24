const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  importAchievementsFromCSV,
  importAchievementsManually,
  getImportTemplate,
  getImportStats
} = require('../controllers/importController');

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(csv|xlsx?)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || 
                    file.mimetype === 'application/csv' ||
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel';

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed!'));
    }
  }
});

// All import routes require admin access
router.use(auth, adminOnly);

// Import achievements from CSV file
router.post('/csv', upload.single('file'), importAchievementsFromCSV);

// Import achievements manually (bulk)
router.post('/manual', importAchievementsManually);

// Get import template
router.get('/template', getImportTemplate);

// Get import statistics
router.get('/stats', getImportStats);

module.exports = router; 