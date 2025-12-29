const Term = require('../models/Term');

// @desc    Get all terms
// @route   GET /api/terms
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    const terms = await Term.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    res.json(terms);
  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current term
// @route   GET /api/terms/current
// @access  Private
exports.getCurrent = async (req, res) => {
  try {
    const term = await Term.findOne({ isCurrent: true })
      .populate('createdBy', 'name email');

    if (!term) {
      return res.status(404).json({ message: 'No current term set' });
    }

    res.json(term);
  } catch (error) {
    console.error('Get current term error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current week info (for dashboard display)
// @route   GET /api/terms/current-week
// @access  Private
exports.getCurrentWeek = async (req, res) => {
  try {
    const now = new Date();

    // Try to find current term (ANY type)
    const currentTerm = await Term.findOne({ isCurrent: true });

    if (currentTerm) {
      // For school terms, calculate week number
      if (currentTerm.type === 'school_term') {
        const termStart = new Date(currentTerm.startDate);
        const daysSinceStart = Math.floor((now - termStart) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysSinceStart / 7) + 1;

        return res.json({
          type: 'current',
          termName: currentTerm.name,
          termType: currentTerm.type,
          week: weekNumber,
          totalWeeks: currentTerm.weeks
        });
      } else {
        // For holidays, just return current status without week number
        return res.json({
          type: 'current',
          termName: currentTerm.name,
          termType: currentTerm.type
        });
      }
    }

    // No current term, find next upcoming term (ANY type - school term or holiday)
    const upcomingTerm = await Term.findOne({
      startDate: { $gt: now }
    }).sort({ startDate: 1 });

    if (upcomingTerm) {
      return res.json({
        type: 'upcoming',
        termName: upcomingTerm.name,
        termType: upcomingTerm.type,
        startDate: upcomingTerm.startDate
      });
    }

    // No current or upcoming term
    res.json({
      type: 'none',
      message: 'No incoming term available'
    });

  } catch (error) {
    console.error('Get current week error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single term
// @route   GET /api/terms/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    res.json(term);
  } catch (error) {
    console.error('Get term error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create term
// @route   POST /api/terms
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const { name, type, startDate, weeks, isFirstTermOfYear, isCurrent } = req.body;

    if (!name || !type || !startDate || !weeks) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const term = await Term.create({
      name,
      type,
      startDate,
      weeks,
      isFirstTermOfYear: isFirstTermOfYear || false,
      isCurrent: isCurrent || false,
      createdBy: req.user._id
    });

    res.status(201).json(term);
  } catch (error) {
    console.error('Create term error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update term
// @route   PUT /api/terms/:id
// @access  Private (Admin)
exports.update = async (req, res) => {
  try {
    const { name, type, startDate, weeks, isFirstTermOfYear, isCurrent } = req.body;

    const term = await Term.findById(req.params.id);

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    if (name) term.name = name;
    if (type) term.type = type;
    if (startDate) term.startDate = startDate;
    if (weeks) term.weeks = weeks;
    if (isFirstTermOfYear !== undefined) term.isFirstTermOfYear = isFirstTermOfYear;
    if (isCurrent !== undefined) term.isCurrent = isCurrent;

    await term.save();

    res.json(term);
  } catch (error) {
    console.error('Update term error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete term
// @route   DELETE /api/terms/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id);

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    if (term.isCurrent) {
      return res.status(400).json({ message: 'Cannot delete current term' });
    }

    await Term.findByIdAndDelete(req.params.id);

    res.json({ message: 'Term deleted successfully' });
  } catch (error) {
    console.error('Delete term error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
