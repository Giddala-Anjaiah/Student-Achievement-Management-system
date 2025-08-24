const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const {
  getAllNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

router.get('/', getAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
