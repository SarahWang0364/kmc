const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// @desc    Register user (verify email + initial password, set new password)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, initialPassword, newPassword } = req.body;

    if (!email || !initialPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.initialPasswordUsed) {
      return res.status(400).json({ message: 'Account already registered. Please login.' });
    }

    // Verify initial password matches
    if (user.initialPassword !== initialPassword) {
      return res.status(401).json({ message: 'Invalid initial password' });
    }

    // Set new password and mark initial password as used
    user.password = newPassword;
    user.initialPasswordUsed = true;
    user.initialPassword = undefined; // Remove initial password

    await user.save();

    res.status(200).json({
      message: 'Registration successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
    }

    if (!user.initialPasswordUsed) {
      return res.status(401).json({ message: 'Please register first using your initial password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isStudent: user.isStudent,
        isTeacher: user.isTeacher,
        isAdmin: user.isAdmin,
        school: user.school,
        year: user.year,
        startingTerm: user.startingTerm
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -initialPassword -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isStudent: user.isStudent,
      isTeacher: user.isTeacher,
      isAdmin: user.isAdmin,
      school: user.school,
      year: user.year,
      startingTerm: user.startingTerm,
      notes: user.notes,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // TODO: Send email with reset link
    // For now, just return the token (in production, this should be emailed)
    console.log('Password reset token:', resetToken);
    console.log('Reset URL:', resetUrl);

    res.json({
      message: 'Password reset email sent. Please check your email.',
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide new password' });
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
