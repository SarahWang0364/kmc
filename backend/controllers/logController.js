const OperationLog = require('../models/OperationLog');

// @desc    Get all operation logs with filtering and pagination
// @route   GET /api/logs
// @access  Private (Admin)
const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user,
      action,
      resourceType,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const logs = await OperationLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await OperationLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Error fetching operation logs' });
  }
};

// @desc    Get logs for a specific resource
// @route   GET /api/logs/resource/:resourceType/:resourceId
// @access  Private (Admin)
const getResourceLogs = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    const logs = await OperationLog.find({
      resourceType,
      resourceId
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Get resource logs error:', error);
    res.status(500).json({ message: 'Error fetching resource logs' });
  }
};

// @desc    Get logs for current user
// @route   GET /api/logs/my-logs
// @access  Private
const getMyLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await OperationLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await OperationLog.countDocuments({ user: req.user._id });

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my logs error:', error);
    res.status(500).json({ message: 'Error fetching your logs' });
  }
};

module.exports = {
  getLogs,
  getResourceLogs,
  getMyLogs
};
