const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Check if studentId is unique for students
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists.' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, department, studentId } = req.body;
    const updates = {};

    // Only allow updating certain fields
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (department) updates.department = department;
    if (studentId && req.user.role === 'student') updates.studentId = studentId;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists.' });
      }
    }

    // Check if studentId is already taken by another student
    if (studentId && studentId !== req.user.studentId && req.user.role === 'student') {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists.' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password using findByIdAndUpdate to avoid pre-save hook
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  resetPassword,
};
