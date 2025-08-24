const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Generate portfolio data
const generatePortfolio = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const [user, achievements] = await Promise.all([
      User.findById(userId),
      Achievement.find({ studentId: userId, status: 'approved' })
        .populate('validatedBy', 'name')
        .sort({ date: -1 })
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Calculate portfolio statistics
    const totalAchievements = achievements.length;
    const categories = [...new Set(achievements.map(a => a.category))];
    const categoriesCount = categories.length;

    // Group achievements by category
    const achievementsByCategory = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {});

    const portfolio = {
      user: {
        name: user.name,
        studentId: user.studentId,
        department: user.department,
        email: user.email
      },
      statistics: {
        totalAchievements,
        approvedAchievements: totalAchievements,
        categoriesCount,
        categories
      },
      achievementsByCategory,
      achievements
    };

    res.json(portfolio);
  } catch (error) {
    console.error('Generate portfolio error:', error);
    res.status(500).json({ message: 'Server error while generating portfolio.' });
  }
};

// Export portfolio as PDF (placeholder - would need PDF generation library)
const exportPDF = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // This is a placeholder - in a real implementation, you would:
    // 1. Generate portfolio data
    // 2. Use a library like puppeteer or jsPDF to create PDF
    // 3. Return the PDF file
    
    res.json({ 
      message: 'PDF export functionality would be implemented here.',
      note: 'Consider using puppeteer or jsPDF for actual PDF generation'
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'Server error while exporting PDF.' });
  }
};

module.exports = {
  generatePortfolio,
  exportPDF
};
