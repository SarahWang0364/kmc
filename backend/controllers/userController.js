const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Admin/Teacher)
exports.getStudents = async (req, res) => {
  try {
    const { search, year, isActive } = req.query;

    const query = { isStudent: true };

    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (year) {
      query.year = year;
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const students = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// @desc    Get all staff (teachers and admins)
// @route   GET /api/users/staff
// @access  Private (Admin)
exports.getStaff = async (req, res) => {
  try {
    const query = {
      $or: [
        { isTeacher: true },
        { isAdmin: true }
      ]
    };

    const staff = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ name: 1 });

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      isStudent,
      isTeacher,
      isAdmin,
      school,
      year,
      startingTerm,
      notes
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate initial password if not provided
    const userPassword = password || User.generateInitialPassword();

    const userData = {
      name,
      email,
      phone,
      password: userPassword,
      isStudent: isStudent || false,
      isTeacher: isTeacher || false,
      isAdmin: isAdmin || false,
      initialPasswordUsed: false,
      isActive: true
    };

    // Add student-specific fields
    if (isStudent) {
      if (school) userData.school = school;
      if (year) userData.year = year;
      if (startingTerm) userData.startingTerm = startingTerm;
      if (notes) userData.notes = notes;
    }

    const user = await User.create(userData);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      initialPassword: userPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow admin or user themselves to update
    if (!req.user.isAdmin && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const {
      name,
      email,
      phone,
      school,
      year,
      notes,
      isActive
    } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (school !== undefined) user.school = school;
    if (year) user.year = year;
    if (notes !== undefined) user.notes = notes;

    // Only admin can change active status
    if (req.user.isAdmin && isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message || 'Error updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// @desc    Deactivate user
// @route   PATCH /api/users/:id/deactivate
// @access  Private (Admin)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Error deactivating user' });
  }
};

// @desc    Reactivate user
// @route   PATCH /api/users/:id/reactivate
// @access  Private (Admin)
exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ message: 'Error reactivating user' });
  }
};
