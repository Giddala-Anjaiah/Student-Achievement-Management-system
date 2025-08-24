// Role-based authorization middleware

// Check if user has any of the specified roles
const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Student only access
const studentOnly = (req, res, next) => {
  return roleAuth(['student'])(req, res, next);
};

// Faculty only access
const facultyOnly = (req, res, next) => {
  return roleAuth(['faculty', 'admin'])(req, res, next);
};

// Admin only access
const adminOnly = (req, res, next) => {
  return roleAuth(['admin'])(req, res, next);
};

// Faculty or Admin access
const facultyOrAdmin = (req, res, next) => {
  return roleAuth(['faculty', 'admin'])(req, res, next);
};

module.exports = {
  roleAuth,
  studentOnly,
  facultyOnly,
  adminOnly,
  facultyOrAdmin
}; 