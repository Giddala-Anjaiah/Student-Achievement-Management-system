const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['achievement_approved', 'achievement_rejected', 'system', 'general'],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedAchievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  actionUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
