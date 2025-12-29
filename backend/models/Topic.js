const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    required: true,
    enum: ['Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y12 3U', 'Y12 4U']
  },
  term: {
    type: String,
    required: true,
    enum: ['T1', 'T2', 'T3', 'T4']
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
topicSchema.index({ year: 1, term: 1 });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
