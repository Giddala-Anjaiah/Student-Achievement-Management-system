const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

// Get admin dashboard data
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAchievements,
      pendingAchievements,
      totalNotifications,
      recentAchievements,
      userStats
    ] = await Promise.all([
      User.countDocuments(),
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'pending' }),
      Notification.countDocuments(),
      Achievement.find()
        .populate('studentId', 'name studentId')
        .sort({ createdAt: -1 })
        .limit(10),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    console.log('Dashboard data values:', {
      totalUsers,
      totalAchievements,
      pendingAchievements,
      totalNotifications,
      userStats: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });

    const dashboardData = {
      totalUsers,
      totalAchievements,
      pendingAchievements,
      totalNotifications,
      recentAchievements,
      userStats: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data.' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    console.log('Create user request body:', req.body);
    const {
      name,
      email,
      password,
      role,
      studentId,
      department
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({ 
        message: 'Missing required fields. Name, email, password, and department are required.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Validate role
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the User model pre-save hook
      role,
      studentId,
      department
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully.',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating user.' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'User role updated successfully.',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role.' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user.' });
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully.',
      deletedUserId: userId
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalAchievements,
      approvedAchievements,
      pendingAchievements,
      rejectedAchievements,
      categoryStats,
      departmentStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'approved' }),
      Achievement.countDocuments({ status: 'pending' }),
      Achievement.countDocuments({ status: 'rejected' }),
      Achievement.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      users: {
        total: totalUsers,
        students: totalStudents,
        faculty: totalFaculty,
        admins: totalAdmins
      },
      achievements: {
        total: totalAchievements,
        approved: approvedAchievements,
        pending: pendingAchievements,
        rejected: rejectedAchievements
      },
      categoryStats,
      departmentStats
    };

    res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error while fetching system statistics.' });
  }
};

// Helper function to process user data
const processUserData = async (results, errors, req, res) => {
  const fs = require('fs');
  let successCount = 0;
  
  try {
    console.log('Total rows read:', results.length);
    console.log('First row keys:', Object.keys(results[0] || {}));
    
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 1;

      try {
        console.log(`Processing row ${rowNumber}:`, JSON.stringify(row, null, 2));
        
        // Check if row has data
        if (!row || Object.keys(row).length === 0) {
          errors.push(`Row ${rowNumber}: Empty row`);
          continue;
        }

        // Validate required fields - check for both exact and case-insensitive matches
        const name = row.name || row.Name || row.NAME;
        const email = row.email || row.Email || row.EMAIL;
        const password = row.password || row.Password || row.PASSWORD;
        
        // More comprehensive role field detection
        let role = '';
        if (row.role) role = row.role.trim().toLowerCase();
        else if (row.Role) role = row.Role.trim().toLowerCase();
        else if (row.ROLE) role = row.ROLE.trim().toLowerCase();
        else if (row['role']) role = row['role'].trim().toLowerCase();
        else if (row['Role']) role = row['Role'].trim().toLowerCase();
        
        const department = (row.department || row.Department || row.DEPARTMENT || '').trim().toUpperCase();
        const studentId = row.studentId || row.studentid || row.StudentId || row.STUDENTID;
        const isActive = row.isActive || row.isactive || row.IsActive || row.ISACTIVE;

        // Fallback: if role is empty but we have a studentId, assume it's a student
        if (!role && studentId) {
          role = 'student';
        }
        
        // Additional fallback: check if any field contains role-like values
        if (!role) {
          const allValues = Object.values(row).join(' ').toLowerCase();
          if (allValues.includes('student')) role = 'student';
          else if (allValues.includes('faculty')) role = 'faculty';
          else if (allValues.includes('admin')) role = 'admin';
        }

        console.log(`Row ${rowNumber} extracted values:`, {
          name, email, password: password ? '***' : 'missing', 
          role, department, studentId, isActive
        });
        console.log(`Row ${rowNumber} raw role field:`, `"${row.role}"`);
        console.log(`Row ${rowNumber} all row keys:`, Object.keys(row));
        console.log(`Row ${rowNumber} all row values:`, Object.values(row));

        if (!name || !email || !password || !role || !department) {
          errors.push(`Row ${rowNumber}: Missing required fields. Found: name="${name}", email="${email}", password="${password ? '***' : 'missing'}", role="${role}", department="${department}"`);
          continue;
        }

        // Validate role
        if (!['student', 'faculty', 'admin'].includes(role)) {
          errors.push(`Row ${rowNumber}: Invalid role "${role}". Must be one of: student, faculty, admin`);
          continue;
        }

        // Validate department
        const validDepartments = ['CSE', 'IT', 'AIML', 'CSM', 'CSO', 'CIC', 'EEE', 'ECE', 'CIVIL', 'MECH', 'CAI', 'AI', 'ML'];
        if (!validDepartments.includes(department)) {
          errors.push(`Row ${rowNumber}: Invalid department "${department}". Must be one of: ${validDepartments.join(', ')}`);
          continue;
        }

        // Check if user already exists
        let existingUser = null;
        if (role === 'student' && studentId) {
          // For students, check both email and studentId
          existingUser = await User.findOne({ 
            $or: [{ email: email.trim().toLowerCase() }, { studentId: studentId.trim() }] 
          });
        } else {
          // For faculty and admin, only check email
          existingUser = await User.findOne({ 
            email: email.trim().toLowerCase()
          });
        }

        if (existingUser) {
          if (role === 'student' && studentId) {
            errors.push(`Row ${rowNumber}: User with email ${email} or student ID ${studentId} already exists`);
          } else {
            errors.push(`Row ${rowNumber}: User with email ${email} already exists`);
          }
          continue;
        }

        // Create user
        const userData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(), // Let the User model hash it
          role: role,
          department: department,
          isActive: isActive !== undefined ? isActive.toString().toLowerCase() === 'true' : true
        };
        
        // Only add studentId for students
        if (role === 'student' && studentId) {
          userData.studentId = studentId.trim();
        }
        
        const user = new User(userData);

        await user.save();
        successCount++;
        console.log(`Successfully created user: ${name} (${email})`);

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'User import completed!',
      successCount,
      errorCount: errors.length,
      totalRows: results.length,
      errors
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

const importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fs = require('fs');
    const path = require('path');
    const results = [];
    const errors = [];

    // Check file extension to determine parsing method
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExtension === '.csv') {
      // Parse CSV file
      const csv = require('csv-parser');
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          console.log('Raw CSV row:', JSON.stringify(row, null, 2));
          console.log('Row keys:', Object.keys(row));
          results.push(row);
        })
        .on('end', async () => {
          await processUserData(results, errors, req, res);
        });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // Parse Excel file
      const xlsx = require('xlsx');
      try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert Excel data to match CSV format
        if (excelData.length > 0) {
          const headers = excelData[0];
          for (let i = 1; i < excelData.length; i++) {
            const row = {};
            excelData[i].forEach((cell, index) => {
              if (headers[index]) {
                row[headers[index]] = cell;
              }
            });
            console.log('Raw Excel row:', JSON.stringify(row, null, 2));
            results.push(row);
          }
        }
        
        await processUserData(results, errors, req, res);
      } catch (error) {
        console.error('Excel parsing error:', error);
        res.status(500).json({ message: 'Excel file parsing failed', error: error.message });
      }
    } else {
      res.status(400).json({ message: 'Unsupported file format. Please upload CSV or Excel files.' });
    }
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  updateUserRole,
  createUser,
  deleteUser,
  importUsers
};
