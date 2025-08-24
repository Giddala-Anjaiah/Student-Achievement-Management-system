const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Advanced search for achievements
const searchAchievements = async (req, res) => {
  try {
    const {
      query,
      category,
      level,
      status,
      department,
      dateFrom,
      dateTo,
      studentName,
      organization,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build search criteria
    const searchCriteria = {};

    // Text search
    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { studentName: { $regex: query, $options: 'i' } },
        { organization: { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      searchCriteria.category = category;
    }

    // Level filter
    if (level) {
      searchCriteria.level = level;
    }

    // Status filter
    if (status) {
      searchCriteria.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchCriteria.date = {};
      if (dateFrom) {
        searchCriteria.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchCriteria.date.$lte = new Date(dateTo);
      }
    }

    // Student name filter
    if (studentName) {
      searchCriteria.studentName = { $regex: studentName, $options: 'i' };
    }

    // Organization filter
    if (organization) {
      searchCriteria.organization = { $regex: organization, $options: 'i' };
    }

    // Department filter (requires lookup)
    let departmentFilter = {};
    if (department) {
      const studentsInDepartment = await User.find(
        { department: { $regex: department, $options: 'i' }, role: 'student' },
        '_id'
      );
      const studentIds = studentsInDepartment.map(student => student._id);
      searchCriteria.studentId = { $in: studentIds };
    }

    // Build sort criteria
    const sortCriteria = {};
    sortCriteria[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with pagination
    const [achievements, total] = await Promise.all([
      Achievement.find(searchCriteria)
        .populate('studentId', 'name department studentId')
        .populate('validatedBy', 'name')
        .sort(sortCriteria)
        .skip(skip)
        .limit(parseInt(limit)),
      Achievement.countDocuments(searchCriteria)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      achievements,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        query,
        category,
        level,
        status,
        department,
        dateFrom,
        dateTo,
        studentName,
        organization
      }
    });
  } catch (error) {
    console.error('Search achievements error:', error);
    res.status(500).json({ message: 'Server error while searching achievements.' });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Achievement.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { studentName: { $regex: query, $options: 'i' } },
            { organization: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: '$title' },
          students: { $addToSet: '$studentName' },
          organizations: { $addToSet: '$organization' }
        }
      }
    ]);

    const allSuggestions = [];
    
    if (suggestions.length > 0) {
      const suggestion = suggestions[0];
      
      // Add title suggestions
      suggestion.titles.forEach(title => {
        if (title.toLowerCase().includes(query.toLowerCase())) {
          allSuggestions.push({ type: 'title', value: title });
        }
      });

      // Add student name suggestions
      suggestion.students.forEach(student => {
        if (student.toLowerCase().includes(query.toLowerCase())) {
          allSuggestions.push({ type: 'student', value: student });
        }
      });

      // Add organization suggestions
      suggestion.organizations.forEach(org => {
        if (org && org.toLowerCase().includes(query.toLowerCase())) {
          allSuggestions.push({ type: 'organization', value: org });
        }
      });
    }

    // Limit suggestions and remove duplicates
    const uniqueSuggestions = allSuggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.value === suggestion.value)
      )
      .slice(0, 10);

    res.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error while getting search suggestions.' });
  }
};

// Get available filter options
const getFilterOptions = async (req, res) => {
  try {
    const [categories, levels, departments, organizations] = await Promise.all([
      Achievement.distinct('category'),
      Achievement.distinct('level'),
      User.distinct('department', { role: 'student' }),
      Achievement.distinct('organization').then(orgs => orgs.filter(org => org))
    ]);

    res.json({
      categories: categories.sort(),
      levels: levels.sort(),
      departments: departments.sort(),
      organizations: organizations.sort()
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: 'Server error while getting filter options.' });
  }
};

module.exports = {
  searchAchievements,
  getSearchSuggestions,
  getFilterOptions
}; 