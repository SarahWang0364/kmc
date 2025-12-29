const DetentionSlot = require('../models/DetentionSlot');
const Classroom = require('../models/Classroom');
const Term = require('../models/Term');

// @desc    Get all detention slots
// @route   GET /api/detention-slots
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { date, classroom, available, term } = req.query;
    const query = {};

    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.date = {
        $gte: targetDate,
        $lt: nextDate
      };
    }

    if (classroom) {
      query.classroom = classroom;
    }

    if (term) {
      query.term = term;
    }

    if (available === 'true') {
      query.$expr = { $lt: ['$bookedCount', '$capacity'] };
    }

    const slots = await DetentionSlot.find(query)
      .populate('classroom', 'name capacity')
      .populate('term', 'name type weeks')
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Get detention slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single detention slot
// @route   GET /api/detention-slots/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const slot = await DetentionSlot.findById(req.params.id)
      .populate('classroom', 'name capacity')
      .populate('createdBy', 'name email');

    if (!slot) {
      return res.status(404).json({ message: 'Detention slot not found' });
    }

    res.json(slot);
  } catch (error) {
    console.error('Get detention slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create detention slot(s)
// @route   POST /api/detention-slots
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const { date, startTime, endTime, classroom, dates } = req.body;

    // Validate classroom exists
    const classroomDoc = await Classroom.findById(classroom);
    if (!classroomDoc) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Batch creation if multiple dates provided
    if (dates && Array.isArray(dates)) {
      const slots = [];

      for (const slotDate of dates) {
        const slot = await DetentionSlot.create({
          date: slotDate,
          startTime,
          endTime,
          classroom,
          capacity: classroomDoc.capacity,
          bookedCount: 0,
          createdBy: req.user._id
        });
        slots.push(slot);
      }

      return res.status(201).json({
        message: `${slots.length} detention slots created`,
        slots
      });
    }

    // Single slot creation
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const slot = await DetentionSlot.create({
      date,
      startTime,
      endTime,
      classroom,
      capacity: classroomDoc.capacity,
      bookedCount: 0,
      createdBy: req.user._id
    });

    await slot.populate('classroom createdBy');

    res.status(201).json(slot);
  } catch (error) {
    console.error('Create detention slot error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update detention slot
// @route   PUT /api/detention-slots/:id
// @access  Private (Admin)
exports.update = async (req, res) => {
  try {
    const { date, startTime, endTime, classroom } = req.body;

    const slot = await DetentionSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: 'Detention slot not found' });
    }

    if (date) slot.date = date;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;

    if (classroom) {
      const classroomDoc = await Classroom.findById(classroom);
      if (!classroomDoc) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      slot.classroom = classroom;
      slot.capacity = classroomDoc.capacity;
    }

    await slot.save();
    await slot.populate('classroom createdBy');

    res.json(slot);
  } catch (error) {
    console.error('Update detention slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete detention slot
// @route   DELETE /api/detention-slots/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const slot = await DetentionSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: 'Detention slot not found' });
    }

    if (slot.bookedCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete slot with active bookings'
      });
    }

    await DetentionSlot.findByIdAndDelete(req.params.id);

    res.json({ message: 'Detention slot deleted successfully' });
  } catch (error) {
    console.error('Delete detention slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Batch toggle detention slots for a specific slot position
// @route   POST /api/detention-slots/batch-toggle
// @access  Private (Admin)
exports.batchToggle = async (req, res) => {
  try {
    const { term, classroom, week, dayOfWeek, slotNumber, enable } = req.body;

    if (!term || !classroom || (!week && week !== 0) || (!dayOfWeek && dayOfWeek !== 0) || (!slotNumber && slotNumber !== 0)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get term and classroom data
    const [termDoc, classroomDoc] = await Promise.all([
      Term.findById(term),
      Classroom.findById(classroom)
    ]);

    if (!termDoc) {
      return res.status(404).json({ message: 'Term not found' });
    }

    if (!classroomDoc) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Determine slot times based on term type
    const slotTimes = termDoc.type === 'school_term'
      ? [
          { startTime: '16:00', endTime: '18:30' },
          { startTime: '18:30', endTime: '21:00' }
        ]
      : [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '12:30', endTime: '15:30' }
        ];

    const slot = slotTimes[slotNumber];
    if (!slot) {
      return res.status(400).json({ message: 'Invalid slot number' });
    }

    // Calculate the date for this week and day
    // Weeks start on Saturday. Term starts on a Saturday.
    // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Offset from Saturday: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
    const termStart = new Date(termDoc.startDate);
    const weeksToAdd = week - 1;
    const dayOffsetInWeek = (dayOfWeek + 1) % 7; // Convert JS day to offset from Saturday
    const daysToAdd = weeksToAdd * 7 + dayOffsetInWeek;

    const slotDate = new Date(termStart);
    slotDate.setDate(slotDate.getDate() + daysToAdd);

    if (enable) {
      // Create the slot if it doesn't exist
      const existingSlot = await DetentionSlot.findOne({
        term,
        classroom,
        week,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      if (!existingSlot) {
        const newSlot = await DetentionSlot.create({
          term,
          classroom,
          week,
          date: slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: classroomDoc.capacity,
          bookedCount: 0,
          createdBy: req.user._id
        });

        await newSlot.populate('classroom term createdBy');
        return res.json({ message: 'Slot created', slot: newSlot });
      } else {
        return res.json({ message: 'Slot already exists', slot: existingSlot });
      }
    } else {
      // Delete the slot if it exists and has no bookings
      const existingSlot = await DetentionSlot.findOne({
        term,
        classroom,
        week,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      if (existingSlot) {
        if (existingSlot.bookedCount > 0) {
          return res.status(400).json({
            message: 'Cannot delete slot with active bookings'
          });
        }

        await DetentionSlot.findByIdAndDelete(existingSlot._id);
        return res.json({ message: 'Slot deleted' });
      } else {
        return res.json({ message: 'Slot does not exist' });
      }
    }
  } catch (error) {
    console.error('Batch toggle detention slots error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get slots grid for a term and classroom
// @route   GET /api/detention-slots/grid
// @access  Private
exports.getGrid = async (req, res) => {
  try {
    const { term, classroom } = req.query;

    if (!term || !classroom) {
      return res.status(400).json({ message: 'Term and classroom are required' });
    }

    const slots = await DetentionSlot.find({ term, classroom })
      .populate('classroom', 'name capacity')
      .populate('term', 'name type weeks startDate')
      .sort({ week: 1, date: 1, startTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Get grid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
