const Class = require('../models/Class');
const Term = require('../models/Term');
const User = require('../models/User');
const classService = require('../services/classService');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { search, term, teacher, year, classroom } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (term) {
      query.term = term;
    } else {
      // Default to current term
      const currentTerm = await Term.findOne({ isCurrent: true });
      if (currentTerm) {
        query.term = currentTerm._id;
      }
    }

    if (teacher) {
      query.teacher = teacher;
    }

    if (year) {
      query.year = year;
    }

    if (classroom) {
      query.classroom = classroom;
    }

    const classes = await Class.find(query)
      .populate('teacher', 'name email')
      .populate('classroom', 'name capacity')
      .populate('term', 'name type')
      .populate('progress', 'name')
      .populate('students.student', 'name email')
      .sort({ name: 1 });

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email phone')
      .populate('classroom', 'name capacity')
      .populate('term', 'name type weeks')
      .populate('progress')
      .populate({
        path: 'progress',
        populate: {
          path: 'weeklyContent.topics weeklyContent.test'
        }
      })
      .populate('students.student', 'name email phone school year')
      .populate('weeklyData.attendance.student', 'name')
      .populate('weeklyData.homework.student', 'name')
      .populate('weeklyData.test.marks.student', 'name')
      .populate('weeklyData.test.test', 'name')
      .populate('weeklyData.classNotes.uploadedBy', 'name');

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classItem);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private (Admin)
exports.create = async (req, res) => {
  try {
    const {
      name,
      year,
      teacher,
      classroom,
      term,
      progress,
      schedule,
      students,
      copyToNextTerm
    } = req.body;

    if (!year || !teacher || !classroom || !term || !schedule) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    // Get term to initialize weeklyData
    const termDoc = await Term.findById(term);
    if (!termDoc) {
      return res.status(404).json({ message: 'Term not found' });
    }

    // Validate schedule based on term type
    if (termDoc.type === 'school_term' && schedule.length > 1) {
      return res.status(400).json({
        message: 'School terms can only have 1 weekday'
      });
    }

    if (termDoc.type === 'holiday' && schedule.length > 3) {
      return res.status(400).json({
        message: 'Holidays can have maximum 3 weekdays'
      });
    }

    // Initialize weekly data
    const weeklyData = [];
    for (let week = 1; week <= termDoc.weeks; week++) {
      weeklyData.push({
        week,
        classNotes: [],
        attendance: [],
        homework: [],
        test: { marks: [] }
      });
    }

    // Auto-generate class name if not provided
    let className = name;
    if (!className) {
      const teacherDoc = await User.findById(teacher);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const primarySlot = schedule[0];
      const day = days[primarySlot.dayOfWeek];
      const [hours, minutes] = primarySlot.startTime.split(':').map(Number);
      const period = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours > 12 ? hours - 12 : hours;
      const time = `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;

      className = `${teacherDoc.name} ${year} ${day} ${time}`;
    }

    const classItem = await Class.create({
      name: className,
      year,
      teacher,
      classroom,
      term,
      progress,
      schedule,
      students: students || [],
      weeklyData,
      copyToNextTerm: copyToNextTerm || false,
      isActive: true
    });

    await classItem.populate('teacher classroom term progress students.student');

    res.status(201).json(classItem);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
exports.update = async (req, res) => {
  try {
    const {
      name,
      year,
      teacher,
      classroom,
      term,
      progress,
      schedule,
      students,
      copyToNextTerm,
      isActive
    } = req.body;

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (name) classItem.name = name;
    if (year) classItem.year = year;
    if (teacher) classItem.teacher = teacher;
    if (classroom) classItem.classroom = classroom;
    if (term) classItem.term = term;
    if (progress) classItem.progress = progress;
    if (schedule) classItem.schedule = schedule;
    if (students) classItem.students = students;
    if (copyToNextTerm !== undefined) classItem.copyToNextTerm = copyToNextTerm;
    if (isActive !== undefined) classItem.isActive = isActive;

    await classItem.save();
    await classItem.populate('teacher classroom term progress students.student');

    res.json(classItem);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark attendance for a week
// @route   POST /api/classes/:id/attendance
// @access  Private (Admin/Teacher)
exports.markAttendance = async (req, res) => {
  try {
    const { week, attendanceData } = req.body;

    if (!week || !attendanceData) {
      return res.status(400).json({
        message: 'Please provide week and attendance data'
      });
    }

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const weekIndex = classItem.weeklyData.findIndex(w => w.week === week);

    if (weekIndex === -1) {
      return res.status(404).json({ message: 'Week not found' });
    }

    classItem.weeklyData[weekIndex].attendance = attendanceData;

    await classItem.save();

    res.json(classItem.weeklyData[weekIndex]);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Grade homework for a week
// @route   POST /api/classes/:id/homework
// @access  Private (Admin/Teacher)
exports.gradeHomework = async (req, res) => {
  try {
    const { week, homeworkData } = req.body;

    if (!week || !homeworkData) {
      return res.status(400).json({
        message: 'Please provide week and homework data'
      });
    }

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const weekIndex = classItem.weeklyData.findIndex(w => w.week === week);

    if (weekIndex === -1) {
      return res.status(404).json({ message: 'Week not found' });
    }

    classItem.weeklyData[weekIndex].homework = homeworkData;

    await classItem.save();

    res.json(classItem.weeklyData[weekIndex]);
  } catch (error) {
    console.error('Grade homework error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enter test marks for a week
// @route   POST /api/classes/:id/test-marks
// @access  Private (Admin/Teacher)
exports.enterTestMarks = async (req, res) => {
  try {
    const { week, testId, marks } = req.body;

    if (!week || !testId || !marks) {
      return res.status(400).json({
        message: 'Please provide week, test ID, and marks'
      });
    }

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const weekIndex = classItem.weeklyData.findIndex(w => w.week === week);

    if (weekIndex === -1) {
      return res.status(404).json({ message: 'Week not found' });
    }

    classItem.weeklyData[weekIndex].test = {
      test: testId,
      marks: marks
    };

    await classItem.save();

    res.json(classItem.weeklyData[weekIndex]);
  } catch (error) {
    console.error('Enter test marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Private (Admin)
exports.addStudent = async (req, res) => {
  try {
    const { studentId, joinedWeek } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Please provide student ID' });
    }

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if student already in class
    const exists = classItem.students.some(
      s => s.student.toString() === studentId
    );

    if (exists) {
      return res.status(400).json({ message: 'Student already in this class' });
    }

    classItem.students.push({
      student: studentId,
      joinedWeek: joinedWeek || 1,
      schoolTestResults: ''
    });

    await classItem.save();
    await classItem.populate('students.student', 'name email');

    res.json(classItem);
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin)
exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classItem.students = classItem.students.filter(
      s => s.student.toString() !== studentId
    );

    await classItem.save();

    res.json({ message: 'Student removed from class' });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
exports.delete = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's classes
// @route   GET /api/classes/today
// @access  Private
exports.getTodaysClasses = async (req, res) => {
  try {
    const classes = await classService.getTodaysClasses();

    // Calculate current week for each class
    const classesWithWeek = classes.map(cls => {
      const currentWeek = calculateCurrentWeek(cls.term);
      return {
        ...cls.toObject(),
        currentWeek
      };
    });

    res.json(classesWithWeek);
  } catch (error) {
    console.error('Get todays classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to calculate current week of term
function calculateCurrentWeek(term) {
  if (!term || !term.startDate) return 1;

  const now = new Date();
  const startDate = new Date(term.startDate);
  const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;

  return Math.max(1, Math.min(weekNumber, term.weeks || 10));
}
