const Topic = require('../models/Topic');

// @desc    Get all topics
// @route   GET /api/topics
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

    const topics = await Topic.find(query)
      .populate('createdBy', 'name email')
      .sort({ year: 1, term: 1, name: 1 });

    res.json(topics);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json(topic);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create topic
// @route   POST /api/topics
// @access  Private (Admin/Teacher)
exports.create = async (req, res) => {
  try {
    const { name, content, year, term } = req.body;

    if (!name || !year || !term) {
      return res.status(400).json({ message: 'Please provide name, year, and term' });
    }

    const topic = await Topic.create({
      name,
      content,
      year,
      term,
      createdBy: req.user._id
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private (Admin/Teacher)
exports.update = async (req, res) => {
  try {
    const { name, content, year, term } = req.body;

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (name) topic.name = name;
    if (content !== undefined) topic.content = content;
    if (year) topic.year = year;
    if (term) topic.term = term;

    await topic.save();

    res.json(topic);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    await Topic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
