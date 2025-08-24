const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendAchievementApprovedEmail, sendAchievementRejectedEmail, sendNewAchievementNotification } = require('../utils/emailService');
const path = require('path');
const fs = require('fs');

// Get all achievements (with filters)
const getAllAchievements = async (req, res) => {
  try {
    const { status, category, studentId, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (studentId) query.studentId = studentId;

    const skip = (page - 1) * limit;

    const achievements = await Achievement.find(query)
      .populate('studentId', 'name studentId department')
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Achievement.countDocuments(query);

    res.json({
      achievements,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error while fetching achievements.' });
  }
};

// Get achievement by ID
const getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('studentId', 'name studentId department')
      .populate('validatedBy', 'name');

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ message: 'Server error while fetching achievement.' });
  }
};

// Create new achievement
const createAchievement = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      date,
      organization,
      documentUrl
    } = req.body;

    const achievement = new Achievement({
      title,
      description,
      category,
      level,
      date,
      organization,
      documentUrl,
      studentId: req.user._id,
      studentName: req.user.name
    });

    await achievement.save();

    // Send email notification to faculty members
    try {
      const facultyMembers = await User.find({ role: 'faculty', isActive: true });
      for (const faculty of facultyMembers) {
        await sendNewAchievementNotification(
          faculty.email,
          faculty.name,
          req.user.name,
          title
        );
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Achievement created successfully.',
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ message: 'Server error while creating achievement.' });
  }
};

// Update achievement
const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }

    // Only allow students to update their own pending achievements
    if (req.user.role === 'student') {
      if (achievement.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      if (achievement.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot update approved/rejected achievements.' });
      }
    }

    const updates = req.body;
    delete updates.status; // Prevent status updates through this route
    delete updates.validatedBy;
    delete updates.validatedAt;

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Achievement updated successfully.',
      achievement: updatedAchievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ message: 'Server error while updating achievement.' });
  }
};

// Delete achievement
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }

    // Only allow students to delete their own pending achievements
    if (req.user.role === 'student') {
      if (achievement.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      if (achievement.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete approved/rejected achievements.' });
      }
    }

    // Delete associated file if exists
    if (achievement.documentUrl) {
      const filePath = path.join(__dirname, '..', achievement.documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Achievement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Achievement deleted successfully.' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ message: 'Server error while deleting achievement.' });
  }
};

// Validate achievement (approve/reject)
const validateAchievement = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }

    if (achievement.status !== 'pending') {
      return res.status(400).json({ message: 'Achievement is already processed.' });
    }

    const updateData = {
      status,
      validatedBy: req.user._id,
      validatedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Create notification for student
    const notification = new Notification({
      userId: achievement.studentId,
      title: `Achievement ${status}`,
      message: status === 'approved' 
        ? `Your achievement "${achievement.title}" has been approved.`
        : `Your achievement "${achievement.title}" has been rejected. Reason: ${rejectionReason}`,
      type: status === 'approved' ? 'achievement_approved' : 'achievement_rejected',
      relatedAchievement: achievement._id
    });

    await notification.save();

    // Send email notification
    try {
      const student = await User.findById(achievement.studentId);
      if (student && student.email) {
        if (status === 'approved') {
          await sendAchievementApprovedEmail(student.email, student.name, achievement.title);
        } else if (status === 'rejected') {
          await sendAchievementRejectedEmail(student.email, student.name, achievement.title, rejectionReason);
        }
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Achievement ${status} successfully.`,
      achievement: updatedAchievement
    });
  } catch (error) {
    console.error('Validate achievement error:', error);
    res.status(500).json({ message: 'Server error while validating achievement.' });
  }
};

// Get achievements by user
const getAchievementsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const achievements = await Achievement.find({ studentId: userId })
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(achievements);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Server error while fetching user achievements.' });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully.',
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error while uploading document.' });
  }
};

module.exports = {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  validateAchievement,
  getAchievementsByUser,
  uploadDocument
};
