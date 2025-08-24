const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { 
  getDashboard, 
  getAllUsers, 
  updateUserRole, 
  createUser, 
  deleteUser,
  importUsers 
} = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(csv|xlsx?)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/csv' ||
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel';
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed!'));
    }
  }
});

// Admin routes
router.get('/dashboard', auth, adminOnly, getDashboard);
router.get('/users', auth, adminOnly, getAllUsers);
router.put('/users/:userId/role', auth, adminOnly, updateUserRole);
router.post('/users', auth, adminOnly, createUser);
router.delete('/users/:userId', auth, adminOnly, deleteUser);
router.post('/import-users', auth, adminOnly, upload.single('file'), importUsers);

module.exports = router;
