const Term = require('../models/Term');
const User = require('../models/User');
const { logManual } = require('../middleware/loggingMiddleware');

// Activate a term (set as current)
exports.activateTerm = async (termId, userId) => {
  // Set all terms to isCurrent = false
  await Term.updateMany({}, { isCurrent: false });

  // Set this term to isCurrent = true
  const term = await Term.findByIdAndUpdate(
    termId,
    { isCurrent: true },
    { new: true }
  );

  if (!term) {
    throw new Error('Term not found');
  }

  // If first term of year, increment student years
  if (term.isFirstTermOfYear) {
    await this.incrementStudentYears(userId);
  }

  return term;
};

// Increment all student year levels (Y7 -> Y8, etc.)
exports.incrementStudentYears = async (userId) => {
  const students = await User.find({ isStudent: true, isActive: true });

  const yearMap = {
    'Y6': 'Y7',
    'Y7': 'Y8',
    'Y8': 'Y9',
    'Y9': 'Y10',
    'Y10': 'Y11',
    'Y11': 'Y12',
    'Y12': null
  };

  const updates = [];

  for (const student of students) {
    const newYear = yearMap[student.year];

    if (newYear) {
      student.year = newYear;
      await student.save();
      updates.push({
        studentId: student._id,
        name: student.name,
        oldYear: yearMap[newYear],
        newYear: newYear
      });
    } else if (student.year === 'Y12') {
      // Deactivate Y12 students
      student.isActive = false;
      await student.save();
      updates.push({
        studentId: student._id,
        name: student.name,
        oldYear: 'Y12',
        status: 'deactivated'
      });
    }
  }

  // Log the operation
  if (userId) {
    await logManual(
      { user: { _id: userId } },
      'update',
      'Term',
      null,
      {
        operation: 'incrementStudentYears',
        affectedStudents: updates.length,
        details: updates
      }
    );
  }

  return updates;
};

// Get current term
exports.getCurrentTerm = async () => {
  const term = await Term.findOne({ isCurrent: true });
  return term;
};

// Calculate current week number based on term start date
exports.getCurrentWeek = async () => {
  const currentTerm = await this.getCurrentTerm();

  if (!currentTerm) {
    return null;
  }

  const now = new Date();
  const startDate = new Date(currentTerm.startDate);
  const diffTime = now - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(diffDays / 7) + 1;

  return Math.min(Math.max(currentWeek, 1), currentTerm.weeks);
};
