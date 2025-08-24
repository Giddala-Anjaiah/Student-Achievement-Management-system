const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Get top achievers
const getTopAchievers = async (req, res) => {
  try {
    const topAchievers = await Achievement.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: '$studentName' },
          achievementCount: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { achievementCount: -1, totalPoints: -1 } },
      { $limit: 10 }
    ]);

    // Get additional user details
    const userIds = topAchievers.map(achiever => achiever._id);
    const users = await User.find({ _id: { $in: userIds } }, 'studentId department');

    const result = topAchievers.map(achiever => {
      const user = users.find(u => u._id.toString() === achiever._id.toString());
      return {
        ...achiever,
        studentId: user?.studentId,
        department: user?.department
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get top achievers error:', error);
    res.status(500).json({ message: 'Server error while fetching top achievers.' });
  }
};

// Get category leaders
const getCategoryLeaders = async (req, res) => {
  try {
    const { category } = req.params;
    
    const categoryLeaders = await Achievement.aggregate([
      { 
        $match: { 
          status: 'approved',
          category: category 
        } 
      },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: '$studentName' },
          achievementCount: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { achievementCount: -1, totalPoints: -1 } },
      { $limit: 5 }
    ]);

    // Get additional user details
    const userIds = categoryLeaders.map(leader => leader._id);
    const users = await User.find({ _id: { $in: userIds } }, 'studentId department');

    const result = categoryLeaders.map(leader => {
      const user = users.find(u => u._id.toString() === leader._id.toString());
      return {
        ...leader,
        studentId: user?.studentId,
        department: user?.department
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get category leaders error:', error);
    res.status(500).json({ message: 'Server error while fetching category leaders.' });
  }
};

// Get leaderboard statistics
const getLeaderboardStats = async (req, res) => {
  try {
    const [
      totalAchievements,
      approvedAchievements,
      totalStudents,
      categoryStats
    ] = await Promise.all([
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'student' }),
      Achievement.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalAchievements,
      approvedAchievements,
      totalStudents,
      categoryStats
    });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard statistics.' });
  }
};

module.exports = {
  getTopAchievers,
  getCategoryLeaders,
  getLeaderboardStats
};
