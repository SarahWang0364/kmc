const Test = require('../models/Test');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { search, year, term } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (year) {
      query.year = year;
    }

    if (term) {
      query.term = term;
    }

    const tests = await Test.find(query)
      .populate('createdBy', 'name email')
      .sort({ year: 1, term: 1, name: 1 });

    res.json(tests);
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create test
// @route   POST /api/tests
// @access  Private (Admin/Teacher)
exports.create = async (req, res) => {
  try {
    const { name, year, term } = req.body;

    if (!name || !year || !term) {
      return res.status(400).json({ message: 'Please provide name, year, and term' });
    }

    const test = await Test.create({
      name,
      year,
      term,
      createdBy: req.user._id
    });

    res.status(201).json(test);
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private (Admin/Teacher)
exports.update = async (req, res) => {
  try {
    const { name, year, term } = req.body;

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (name) test.name = name;
    if (year) test.year = year;
    if (term) test.term = term;

    await test.save();

    res.json(test);
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await Test.findByIdAndDelete(req.params.id);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
