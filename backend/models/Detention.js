const mongoose = require('mongoose');

const detentionSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  week: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['assigned', 'booked', 'completed'],
    default: 'assigned'
  },
  bookedSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DetentionSlot'
  },
  completionStatus: {
    type: String,
    enum: ['complete', 'incomplete', 'absent']
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
detentionSchema.index({ student: 1, status: 1 });
detentionSchema.index({ status: 1, assignedAt: -1 });
detentionSchema.index({ bookedSlot: 1 });

const Detention = mongoose.model('Detention', detentionSchema);

module.exports = Detention;
