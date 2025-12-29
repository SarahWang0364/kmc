const Detention = require('../models/Detention');
const DetentionSlot = require('../models/DetentionSlot');

// @desc    Get all detentions
// @route   GET /api/detentions
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { student, status, class: classId } = req.query;
    const query = {};

    if (student) {
      query.student = student;
    }

    if (status) {
      query.status = status;
    }

    if (classId) {
      query.class = classId;
    }

    const detentions = await Detention.find(query)
      .populate('class', 'name')
      .populate('student', 'name email phone')
      .populate('bookedSlot', 'date startTime endTime classroom')
      .populate('assignedBy', 'name')
      .sort({ assignedAt: -1 });

    res.json(detentions);
  } catch (error) {
    console.error('Get detentions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's detentions
// @route   GET /api/detentions/today
// @access  Private
exports.getTodaysDetentions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find detention slots for today
    const todaySlots = await DetentionSlot.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const slotIds = todaySlots.map(slot => slot._id);

    // Find detentions booked for today's slots
    const detentions = await Detention.find({
      bookedSlot: { $in: slotIds }
    })
      .populate('class', 'name')
      .populate('student', 'name email')
      .populate({
        path: 'bookedSlot',
        populate: {
          path: 'classroom',
          select: 'name'
        }
      })
      .populate('assignedBy', 'name')
      .sort({ 'bookedSlot.startTime': 1 });

    res.json(detentions);
  } catch (error) {
    console.error('Get todays detentions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single detention
// @route   GET /api/detentions/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const detention = await Detention.findById(req.params.id)
      .populate('class', 'name')
      .populate('student', 'name email phone')
      .populate('bookedSlot', 'date startTime endTime classroom')
      .populate('assignedBy', 'name email');

    if (!detention) {
      return res.status(404).json({ message: 'Detention not found' });
    }

    res.json(detention);
  } catch (error) {
    console.error('Get detention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create detention (assign to student)
// @route   POST /api/detentions
// @access  Private (Admin/Teacher)
exports.create = async (req, res) => {
  try {
    const { class: classId, student, week, reason } = req.body;

    if (!classId || !student || !week || !reason) {
      return res.status(400).json({
        message: 'Please provide class, student, week, and reason'
      });
    }

    const detention = await Detention.create({
      class: classId,
      student,
      week,
      reason,
      status: 'assigned',
      assignedBy: req.user._id,
      assignedAt: new Date()
    });

    await detention.populate('class student assignedBy');

    res.status(201).json(detention);
  } catch (error) {
    console.error('Create detention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book detention slot
// @route   PATCH /api/detentions/:id/book
// @access  Private (Student/Admin)
exports.bookSlot = async (req, res) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: 'Please provide slot ID' });
    }

    const detention = await Detention.findById(req.params.id);
    if (!detention) {
      return res.status(404).json({ message: 'Detention not found' });
    }

    // Verify student owns this detention or user is admin
    if (detention.student.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const slot = await DetentionSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Detention slot not found' });
    }

    // Check if slot is full
    if (slot.bookedCount >= slot.capacity) {
      return res.status(400).json({ message: 'Detention slot is full' });
    }

    // If detention already has a booking, decrement old slot
    if (detention.bookedSlot) {
      const oldSlot = await DetentionSlot.findById(detention.bookedSlot);
      if (oldSlot) {
        oldSlot.bookedCount = Math.max(0, oldSlot.bookedCount - 1);
        await oldSlot.save();
      }
    }

    // Update detention
    detention.status = 'booked';
    detention.bookedSlot = slotId;
    await detention.save();

    // Increment slot booked count
    slot.bookedCount += 1;
    await slot.save();

    await detention.populate('class student bookedSlot assignedBy');

    res.json(detention);
  } catch (error) {
    console.error('Book detention slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update detention status (complete/incomplete/absent)
// @route   PATCH /api/detentions/:id/status
// @access  Private (Admin/Teacher)
exports.updateStatus = async (req, res) => {
  try {
    const { completionStatus } = req.body;

    if (!completionStatus || !['complete', 'incomplete', 'absent'].includes(completionStatus)) {
      return res.status(400).json({ message: 'Invalid completion status' });
    }

    const detention = await Detention.findById(req.params.id);
    if (!detention) {
      return res.status(404).json({ message: 'Detention not found' });
    }

    detention.completionStatus = completionStatus;

    if (completionStatus === 'complete') {
      detention.status = 'completed';
      detention.attempts += 1;
    } else if (completionStatus === 'incomplete') {
      // Decrement slot count BEFORE clearing bookedSlot
      if (detention.bookedSlot) {
        const slot = await DetentionSlot.findById(detention.bookedSlot);
        if (slot) {
          slot.bookedCount = Math.max(0, slot.bookedCount - 1);
          await slot.save();
        }
      }

      detention.status = 'assigned';
      detention.bookedSlot = null;
      detention.attempts += 1;
    } else if (completionStatus === 'absent') {
      // Decrement slot count BEFORE clearing bookedSlot
      if (detention.bookedSlot) {
        const slot = await DetentionSlot.findById(detention.bookedSlot);
        if (slot) {
          slot.bookedCount = Math.max(0, slot.bookedCount - 1);
          await slot.save();
        }
      }

      detention.status = 'assigned';
      detention.bookedSlot = null;
      // Don't increment attempts for absent
    }

    await detention.save();
    await detention.populate('class student bookedSlot assignedBy');

    res.json(detention);
  } catch (error) {
    console.error('Update detention status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete detention
// @route   DELETE /api/detentions/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const detention = await Detention.findById(req.params.id);

    if (!detention) {
      return res.status(404).json({ message: 'Detention not found' });
    }

    // If booked, decrement slot count
    if (detention.bookedSlot) {
      const slot = await DetentionSlot.findById(detention.bookedSlot);
      if (slot) {
        slot.bookedCount = Math.max(0, slot.bookedCount - 1);
        await slot.save();
      }
    }

    await Detention.findByIdAndDelete(req.params.id);

    res.json({ message: 'Detention deleted successfully' });
  } catch (error) {
    console.error('Delete detention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
