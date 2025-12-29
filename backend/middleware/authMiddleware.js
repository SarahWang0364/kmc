const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Require any authenticated user
const requireAuth = verifyToken;

// Require admin role
const requireAdmin = async (req, res, next) => {
  await verifyToken(req, res, () => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  });
};

// Require teacher or admin role
const requireTeacher = async (req, res, next) => {
  await verifyToken(req, res, () => {
    if (req.user && (req.user.isTeacher || req.user.isAdmin)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Teacher or Admin role required.' });
    }
  });
};

// Require student role (for student-specific endpoints)
const requireStudent = async (req, res, next) => {
  await verifyToken(req, res, () => {
    if (req.user && req.user.isStudent) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Student role required.' });
    }
  });
};

module.exports = {
  verifyToken,
  requireAuth,
  requireAdmin,
  requireTeacher,
  requireStudent
};
