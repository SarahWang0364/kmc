const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteSlot,
  batchToggle,
  getGrid
} = require('../controllers/detentionSlotController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/grid', getGrid);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.post('/batch-toggle', requireAdmin, batchToggle);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, deleteSlot);

module.exports = router;
