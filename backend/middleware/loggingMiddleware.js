const OperationLog = require('../models/OperationLog');

// Helper to create operation log
const createLog = async (userId, action, resourceType, resourceId = null, details = {}, req = null) => {
  try {
    const logData = {
      user: userId,
      action,
      resourceType,
      resourceId,
      details
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await OperationLog.create(logData);
  } catch (error) {
    console.error('Error creating operation log:', error);
    // Don't throw error - logging should not break the app
  }
};

// Middleware to log operations based on HTTP method
const logOperation = (resourceType) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after response
    res.send = function(data) {
      // Determine action based on HTTP method
      let action = 'other';
      if (req.method === 'POST') action = 'create';
      else if (req.method === 'PUT' || req.method === 'PATCH') action = 'update';
      else if (req.method === 'DELETE') action = 'delete';
      else if (req.method === 'GET') action = 'view';

      // Only log if user is authenticated and operation was successful (2xx status code)
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const details = {
          method: req.method,
          path: req.path,
          body: req.body,
          params: req.params,
          query: req.query
        };

        // Extract resource ID if available
        let resourceId = req.params.id || req.body.id || req.body._id;

        // For created resources, try to extract ID from response
        if (action === 'create' && data) {
          try {
            const responseData = JSON.parse(data);
            if (responseData.id || responseData._id) {
              resourceId = responseData.id || responseData._id;
            }
          } catch (e) {
            // Response is not JSON, skip
          }
        }

        createLog(req.user._id, action, resourceType, resourceId, details, req);
      }

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

// Manual logging function (for use in controllers)
const logManual = async (req, action, resourceType, resourceId = null, details = {}) => {
  if (req.user) {
    await createLog(req.user._id, action, resourceType, resourceId, details, req);
  }
};

module.exports = {
  logOperation,
  logManual,
  createLog
};
