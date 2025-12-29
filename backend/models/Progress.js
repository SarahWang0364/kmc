const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y12 3U', 'Y12 4U']
  },
  weeklyContent: [{
    week: {
      type: Number,
      required: true
    },
    topics: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic'
    }],
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    comments: {
      type: String,
      trim: true,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// Indexes
progressSchema.index({ term: 1, year: 1 });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
