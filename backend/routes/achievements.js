const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/authMiddleware');
const { facultyOnly } = require('../middleware/roleMiddleware');
const {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  validateAchievement,
  getAchievementsByUser,
  uploadDocument
} = require('../controllers/achievementController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  }
});

// Public routes (with optional auth)
router.get('/', auth, getAllAchievements);

// Student routes
router.post('/', auth, createAchievement);
router.put('/:id', auth, updateAchievement);
router.delete('/:id', auth, deleteAchievement);

// Faculty/Admin routes
router.put('/:id/validate', auth, facultyOnly, validateAchievement);

// File upload route
router.post('/upload', auth, upload.single('file'), uploadDocument);

// Get specific achievement
router.get('/:id', auth, getAchievementById);

// User-specific routes (must come after /:id routes)
router.get('/user/:userId?', auth, getAchievementsByUser);

module.exports = router;
