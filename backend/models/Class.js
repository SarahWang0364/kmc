const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    enum: ['Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y12 3U', 'Y12 4U']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
  progress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress'
  },
  schedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    duration: {
      type: Number,
      required: true,
      min: 30
    }
  }],
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    schoolTestResults: {
      type: String,
      trim: true,
      default: ''
    },
    joinedWeek: {
      type: Number,
      default: 1
    }
  }],
  weeklyData: [{
    week: {
      type: Number,
      required: true
    },
    classNotes: [{
      filename: String,
      fileId: mongoose.Schema.Types.ObjectId,
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    attendance: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['arrived', 'absent']
      }
    }],
    homework: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E', 'incomplete', 'missing', 'absent']
      },
      comments: {
        type: String,
        trim: true,
        default: ''
      }
    }],
    test: {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
      },
      marks: [{
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        mark: Number
      }]
    }
  }],
  copyToNextTerm: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
classSchema.index({ term: 1, teacher: 1 });
classSchema.index({ term: 1, isActive: 1 });
classSchema.index({ 'students.student': 1 });
classSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1, classroom: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
