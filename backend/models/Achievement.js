const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['academic', 'extracurricular', 'cocurricular', 'sports', 'cultural', 'technical', 'leadership'],
    required: true
  },
  level: {
    type: String,
    enum: ['university', 'state', 'national', 'international'],
    default: 'university'
  },
  date: {
    type: Date,
    required: true
  },
  organization: {
    type: String,
    trim: true
  },
  documentUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
achievementSchema.index({ studentId: 1, status: 1 });
achievementSchema.index({ category: 1, status: 1 });
achievementSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
