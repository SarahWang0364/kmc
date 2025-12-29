const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['school_term', 'holiday']
  },
  startDate: {
    type: Date,
    required: true
  },
  weeks: {
    type: Number,
    required: true,
    default: function() {
      return this.type === 'holiday' ? 2 : 10;
    },
    min: [1, 'Term must be at least 1 week'],
    max: [52, 'Term cannot exceed 52 weeks']
  },
  isFirstTermOfYear: {
    type: Boolean,
    default: false
  },
  isCurrent: {
    type: Boolean,
    default: false
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
termSchema.index({ isCurrent: 1 });
termSchema.index({ startDate: -1 });

// Only one term can be current at a time
termSchema.pre('save', async function(next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    await mongoose.model('Term').updateMany(
      { _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

const Term = mongoose.model('Term', termSchema);

module.exports = Term;
