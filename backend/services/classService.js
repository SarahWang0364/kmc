const Class = require('../models/Class');
const Term = require('../models/Term');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Validate schedule doesn't overlap in same classroom
exports.validateSchedule = async (schedule, classroomId, termId, excludeClassId = null) => {
  for (const slot of schedule) {
    const query = {
      classroom: classroomId,
      term: termId,
      'schedule.dayOfWeek': slot.dayOfWeek,
      isActive: true
    };

    if (excludeClassId) {
      query._id = { $ne: excludeClassId };
    }

    const overlappingClasses = await Class.find(query);

    for (const existingClass of overlappingClasses) {
      for (const existingSlot of existingClass.schedule) {
        if (existingSlot.dayOfWeek === slot.dayOfWeek) {
          // Check time overlap
          const newStart = timeToMinutes(slot.startTime);
          const newEnd = newStart + slot.duration;
          const existingStart = timeToMinutes(existingSlot.startTime);
          const existingEnd = existingStart + existingSlot.duration;

          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return {
              valid: false,
              message: `Schedule conflicts with ${existingClass.name}`
            };
          }
        }
      }
    }
  }

  return { valid: true };
};

// Generate class name
exports.generateClassName = async (teacherId, year, schedule) => {
  const teacher = await User.findById(teacherId);

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const primarySlot = schedule[0];

  const day = days[primarySlot.dayOfWeek];
  const time = formatTime(primarySlot.startTime);

  return `${teacher.name} ${year} ${day} ${time}`;
};

// Copy class to next term
exports.copyClassToNextTerm = async (classId, nextTermId) => {
  const originalClass = await Class.findById(classId).populate('term');

  if (!originalClass) {
    throw new Error('Class not found');
  }

  const nextTerm = await Term.findById(nextTermId);

  if (!nextTerm) {
    throw new Error('Next term not found');
  }

  // Initialize weeklyData for new term
  const weeklyData = [];
  for (let week = 1; week <= nextTerm.weeks; week++) {
    weeklyData.push({
      week,
      classNotes: [],
      attendance: [],
      homework: [],
      test: { marks: [] }
    });
  }

  const newClass = new Class({
    name: originalClass.name,
    year: originalClass.year,
    teacher: originalClass.teacher,
    classroom: originalClass.classroom,
    term: nextTermId,
    progress: null, // Progress will need to be set manually or copied separately
    schedule: originalClass.schedule,
    students: originalClass.students.map(s => ({
      student: s.student,
      schoolTestResults: '',
      joinedWeek: 1
    })),
    weeklyData: weeklyData,
    copyToNextTerm: originalClass.copyToNextTerm,
    isActive: true
  });

  await newClass.save();
  return newClass;
};

// Switch student to another class (for absent students)
exports.switchStudent = async (studentId, fromClassId, toClassId, week, userId) => {
  const fromClass = await Class.findById(fromClassId).populate('progress');
  const toClass = await Class.findById(toClassId).populate('progress');

  if (!fromClass || !toClass) {
    throw new Error('Class not found');
  }

  // Validate same progress
  if (!fromClass.progress || !toClass.progress) {
    throw new Error('Both classes must have progress assigned');
  }

  if (fromClass.progress._id.toString() !== toClass.progress._id.toString()) {
    throw new Error('Classes must have the same progress');
  }

  // Validate same week
  const fromWeekData = fromClass.weeklyData.find(w => w.week === week);
  const toWeekData = toClass.weeklyData.find(w => w.week === week);

  if (!fromWeekData || !toWeekData) {
    throw new Error('Week not found in one of the classes');
  }

  // TODO: Validate time > now (requires checking actual class schedule and current time)

  // Record attendance as absent in fromClass
  const attendanceIndex = fromWeekData.attendance.findIndex(
    a => a.student.toString() === studentId
  );

  if (attendanceIndex >= 0) {
    fromWeekData.attendance[attendanceIndex].status = 'absent';
  } else {
    fromWeekData.attendance.push({
      student: studentId,
      status: 'absent'
    });
  }

  await fromClass.save();

  // Mark student as switching (temporary attendance in toClass)
  const toAttendanceIndex = toWeekData.attendance.findIndex(
    a => a.student.toString() === studentId
  );

  if (toAttendanceIndex >= 0) {
    toWeekData.attendance[toAttendanceIndex].status = 'arrived';
  } else {
    toWeekData.attendance.push({
      student: studentId,
      status: 'arrived'
    });
  }

  await toClass.save();

  return {
    fromClass: fromClass._id,
    toClass: toClass._id,
    student: studentId,
    week
  };
};

// Get classes scheduled for today
exports.getTodaysClasses = async () => {
  const today = new Date().getDay();
  const currentTerm = await Term.findOne({ isCurrent: true });

  if (!currentTerm) {
    return [];
  }

  const classes = await Class.find({
    term: currentTerm._id,
    'schedule.dayOfWeek': today,
    isActive: true
  })
    .populate('teacher', 'name')
    .populate('classroom', 'name')
    .populate('students.student', 'name');

  return classes;
};

// Helper functions
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${formattedMinutes}${period}`;
}

module.exports = exports;
