const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get comprehensive analytics
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAchievements,
      approvedAchievements,
      pendingAchievements,
      rejectedAchievements,
      categoryStats,
      monthlyStats,
      departmentStats,
      levelStats,
      topPerformers,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'approved' }),
      Achievement.countDocuments({ status: 'pending' }),
      Achievement.countDocuments({ status: 'rejected' }),
      Achievement.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
      Achievement.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        { $group: { _id: '$student.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$studentId',
            studentName: { $first: '$studentName' },
            count: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        },
        { $sort: { count: -1, totalPoints: -1 } },
        { $limit: 10 }
      ]),
      Achievement.find()
        .populate('studentId', 'name department')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate approval rate
    const approvalRate = totalAchievements > 0 ? (approvedAchievements / totalAchievements * 100).toFixed(1) : 0;

    // Process monthly stats for chart
    const monthlyChartData = monthlyStats.map(stat => ({
      month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
      count: stat.count
    })).reverse();

    // Process category stats for chart
    const categoryChartData = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count
    }));

    // Process department stats for chart
    const departmentChartData = departmentStats.map(stat => ({
      department: stat._id,
      count: stat.count
    }));

    // Process level stats for chart
    const levelChartData = levelStats.map(stat => ({
      level: stat._id,
      count: stat.count
    }));

    // Get user role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get achievement status distribution
    const statusDistribution = [
      { status: 'approved', count: approvedAchievements },
      { status: 'pending', count: pendingAchievements },
      { status: 'rejected', count: rejectedAchievements }
    ];

    // Get recent notifications
    const recentNotifications = await Notification.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const analytics = {
      overview: {
        totalUsers,
        totalAchievements,
        approvedAchievements,
        pendingAchievements,
        rejectedAchievements,
        approvalRate: parseFloat(approvalRate)
      },
      charts: {
        monthlyStats: monthlyChartData,
        categoryStats: categoryChartData,
        departmentStats: departmentChartData,
        levelStats: levelChartData,
        roleDistribution,
        statusDistribution
      },
      topPerformers,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        title: activity.title,
        studentName: activity.studentName,
        status: activity.status,
        category: activity.category,
        createdAt: activity.createdAt
      })),
      recentNotifications: recentNotifications.map(notification => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userName: notification.userId?.name,
        createdAt: notification.createdAt
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics.' });
  }
};

// Get user-specific analytics
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const [
      userAchievements,
      categoryStats,
      monthlyStats,
      levelStats,
      statusStats
    ] = await Promise.all([
      Achievement.find({ studentId: userId }),
      Achievement.aggregate([
        { $match: { studentId: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        { $match: { studentId: userId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
      Achievement.aggregate([
        { $match: { studentId: userId } },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Achievement.aggregate([
        { $match: { studentId: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const totalAchievements = userAchievements.length;
    const approvedAchievements = userAchievements.filter(a => a.status === 'approved').length;
    const pendingAchievements = userAchievements.filter(a => a.status === 'pending').length;
    const rejectedAchievements = userAchievements.filter(a => a.status === 'rejected').length;
    const totalPoints = userAchievements.reduce((sum, a) => sum + (a.points || 0), 0);

    const userAnalytics = {
      overview: {
        totalAchievements,
        approvedAchievements,
        pendingAchievements,
        rejectedAchievements,
        totalPoints,
        approvalRate: totalAchievements > 0 ? (approvedAchievements / totalAchievements * 100).toFixed(1) : 0
      },
      charts: {
        categoryStats: categoryStats.map(stat => ({
          category: stat._id,
          count: stat.count
        })),
        monthlyStats: monthlyStats.map(stat => ({
          month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
          count: stat.count
        })).reverse(),
        levelStats: levelStats.map(stat => ({
          level: stat._id,
          count: stat.count
        })),
        statusStats: statusStats.map(stat => ({
          status: stat._id,
          count: stat.count
        }))
      },
      recentAchievements: userAchievements
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(achievement => ({
          id: achievement._id,
          title: achievement.title,
          status: achievement.status,
          category: achievement.category,
          createdAt: achievement.createdAt
        }))
    };

    res.json(userAnalytics);
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching user analytics.' });
  }
};

module.exports = {
  getAnalytics,
  getUserAnalytics
}; 