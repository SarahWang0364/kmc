const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'view', 'login', 'logout', 'other']
  },
  resourceType: {
    type: String,
    required: true
    // Examples: 'User', 'Class', 'Detention', 'Term', 'Progress', etc.
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: Object,
    // Store changed fields, previous values, etc.
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
operationLogSchema.index({ user: 1, createdAt: -1 });
operationLogSchema.index({ resourceType: 1, createdAt: -1 });
operationLogSchema.index({ action: 1, createdAt: -1 });

const OperationLog = mongoose.model('OperationLog', operationLogSchema);

module.exports = OperationLog;
