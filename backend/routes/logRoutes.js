const express = require('express');
const router = express.Router();
const {
  getLogs,
  getResourceLogs,
  getMyLogs
} = require('../controllers/logController');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

// Admin routes
router.get('/', requireAdmin, getLogs);
router.get('/resource/:resourceType/:resourceId', requireAdmin, getResourceLogs);

// User routes
router.get('/my-logs', requireAuth, getMyLogs);

module.exports = router;
