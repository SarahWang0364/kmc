const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

module.exports = router;
