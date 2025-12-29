const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true,
    trim: true
  },
  solution: {
    type: String,
    trim: true,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
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
followupSchema.index({ isCompleted: 1, dueDate: 1 });
followupSchema.index({ createdBy: 1 });

const Followup = mongoose.model('Followup', followupSchema);

module.exports = Followup;
