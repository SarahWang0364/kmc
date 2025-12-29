const Followup = require('../models/Followup');

// @desc    Get all followups
// @route   GET /api/followups
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { isCompleted } = req.query;
    const query = {};

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    const followups = await Followup.find(query)
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json(followups);
  } catch (error) {
    console.error('Get followups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single followup
// @route   GET /api/followups/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!followup) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    res.json(followup);
  } catch (error) {
    console.error('Get followup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create followup
// @route   POST /api/followups
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const { issue, solution, dueDate } = req.body;

    if (!issue || !dueDate) {
      return res.status(400).json({ message: 'Please provide issue and due date' });
    }

    const followup = await Followup.create({
      issue,
      solution: solution || '',
      dueDate,
      createdBy: req.user._id
    });

    res.status(201).json(followup);
  } catch (error) {
    console.error('Create followup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update followup
// @route   PUT /api/followups/:id
// @access  Private (Admin)
exports.update = async (req, res) => {
  try {
    const { issue, solution, dueDate, isCompleted } = req.body;

    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    if (issue) followup.issue = issue;
    if (solution !== undefined) followup.solution = solution;
    if (dueDate) followup.dueDate = dueDate;

    if (isCompleted !== undefined) {
      followup.isCompleted = isCompleted;
      if (isCompleted) {
        followup.completedAt = new Date();
      } else {
        followup.completedAt = undefined;
      }
    }

    await followup.save();

    res.json(followup);
  } catch (error) {
    console.error('Update followup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark followup as complete
// @route   PATCH /api/followups/:id/complete
// @access  Private (Admin)
exports.markComplete = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    followup.isCompleted = true;
    followup.completedAt = new Date();

    await followup.save();

    res.json(followup);
  } catch (error) {
    console.error('Mark followup complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete followup
// @route   DELETE /api/followups/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    await Followup.findByIdAndDelete(req.params.id);

    res.json({ message: 'Followup deleted successfully' });
  } catch (error) {
    console.error('Delete followup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
