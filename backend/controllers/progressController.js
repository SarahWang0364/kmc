const Progress = require('../models/Progress');

// @desc    Get all progress
// @route   GET /api/progress
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { term, year } = req.query;
    const query = {};

    if (term) {
      query.term = term;
    }

    if (year) {
      query.year = year;
    }

    const progress = await Progress.find(query)
      .populate('term', 'name type')
      .populate('weeklyContent.topics', 'name')
      .populate('weeklyContent.test', 'name')
      .sort({ term: -1, year: 1 });

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single progress
// @route   GET /api/progress/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id)
      .populate('term', 'name type weeks')
      .populate('weeklyContent.topics', 'name content')
      .populate('weeklyContent.test', 'name');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create progress
// @route   POST /api/progress
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const { name, term, year, weeklyContent } = req.body;

    if (!name || !term || !year) {
      return res.status(400).json({ message: 'Please provide name, term, and year' });
    }

    const progress = await Progress.create({
      name,
      term,
      year,
      weeklyContent: weeklyContent || []
    });

    await progress.populate('term weeklyContent.topics weeklyContent.test');

    res.status(201).json(progress);
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update progress
// @route   PUT /api/progress/:id
// @access  Private (Admin/Teacher)
exports.update = async (req, res) => {
  try {
    const { name, term, year, weeklyContent } = req.body;

    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (name) progress.name = name;
    if (term) progress.term = term;
    if (year) progress.year = year;
    if (weeklyContent) progress.weeklyContent = weeklyContent;

    await progress.save();
    await progress.populate('term weeklyContent.topics weeklyContent.test');

    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update weekly content for specific week
// @route   PATCH /api/progress/:id/week/:week
// @access  Private (Admin/Teacher)
exports.updateWeekContent = async (req, res) => {
  try {
    const { id, week } = req.params;
    const { topics, test, comments } = req.body;

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const weekIndex = progress.weeklyContent.findIndex(w => w.week === parseInt(week));

    if (weekIndex === -1) {
      // Add new week
      progress.weeklyContent.push({
        week: parseInt(week),
        topics: topics || [],
        test: test || null,
        comments: comments || ''
      });
    } else {
      // Update existing week
      if (topics) progress.weeklyContent[weekIndex].topics = topics;
      if (test !== undefined) progress.weeklyContent[weekIndex].test = test;
      if (comments !== undefined) progress.weeklyContent[weekIndex].comments = comments;
    }

    await progress.save();
    await progress.populate('weeklyContent.topics weeklyContent.test');

    res.json(progress);
  } catch (error) {
    console.error('Update week content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete progress
// @route   DELETE /api/progress/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    await Progress.findByIdAndDelete(req.params.id);

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
