const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  markComplete,
  delete: deleteFollowup
} = require('../controllers/followupController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.patch('/:id/complete', requireAdmin, markComplete);
router.delete('/:id', requireAdmin, deleteFollowup);

module.exports = router;
