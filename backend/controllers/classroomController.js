const Classroom = require('../models/Classroom');
const Class = require('../models/Class');
const Term = require('../models/Term');

// Helper function to check if classroom is currently occupied
const isClassroomOccupied = async (classroomId) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Find current term (marked as isCurrent)
  const currentTerm = await Term.findOne({ isCurrent: true });

  if (!currentTerm) {
    return false; // No current term, classroom is free
  }

  // Find classes using this classroom in the current term
  const classes = await Class.find({
    classroom: classroomId,
    term: currentTerm._id,
    isActive: true
  });

  // Check if any class is happening right now
  for (const cls of classes) {
    for (const schedule of cls.schedule) {
      if (schedule.dayOfWeek === currentDay) {
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = startMinutes + schedule.duration;

        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMin;

        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          return true; // Class is happening now
        }
      }
    }
  }

  return false;
};

// @desc    Get all classrooms
// @route   GET /api/classrooms
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const classrooms = await Classroom.find(query).sort({ name: 1 });

    // Calculate occupancy status for each classroom
    const classroomsWithStatus = await Promise.all(
      classrooms.map(async (classroom) => {
        const isOccupied = await isClassroomOccupied(classroom._id);
        return {
          ...classroom.toObject(),
          isOccupied
        };
      })
    );

    res.json(classroomsWithStatus);
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single classroom
// @route   GET /api/classrooms/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create classroom
// @route   POST /api/classrooms
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const { name, capacity } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ message: 'Please provide name and capacity' });
    }

    const classroom = await Classroom.create({
      name,
      capacity,
      isActive: true
    });

    res.status(201).json(classroom);
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (Admin)
exports.update = async (req, res) => {
  try {
    const { name, capacity, isActive } = req.body;

    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (name) classroom.name = name;
    if (capacity) classroom.capacity = capacity;
    if (isActive !== undefined) classroom.isActive = isActive;

    await classroom.save();

    res.json(classroom);
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Find current term
    const currentTerm = await Term.findOne({ isCurrent: true });

    if (currentTerm) {
      // Check if there are any classes using this classroom in the current term
      const classesInCurrentTerm = await Class.countDocuments({
        classroom: req.params.id,
        term: currentTerm._id
      });

      if (classesInCurrentTerm > 0) {
        return res.status(400).json({
          message: 'Cannot delete classroom. There are classes scheduled in this room during the current term.'
        });
      }
    }

    await Classroom.findByIdAndDelete(req.params.id);

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
