const mongoose = require('mongoose');

const detentionSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
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
  week: {
    type: Number,
    required: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
detentionSlotSchema.index({ date: 1, classroom: 1 });
detentionSlotSchema.index({ date: 1, bookedCount: 1 });
detentionSlotSchema.index({ term: 1, classroom: 1, week: 1 });

// Validate bookedCount doesn't exceed capacity
detentionSlotSchema.pre('save', function(next) {
  if (this.bookedCount > this.capacity) {
    next(new Error('Booked count cannot exceed capacity'));
  }
  next();
});

const DetentionSlot = mongoose.model('DetentionSlot', detentionSlotSchema);

module.exports = DetentionSlot;
