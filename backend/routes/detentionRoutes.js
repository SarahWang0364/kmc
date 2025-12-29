const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  getTodaysDetentions,
  create,
  bookSlot,
  updateStatus,
  delete: deleteDetention
} = require('../controllers/detentionController');
const { requireAuth, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/today', getTodaysDetentions);
router.get('/:id', getById);
router.post('/', requireTeacher, create);
router.patch('/:id/book', bookSlot);
router.patch('/:id/status', requireTeacher, updateStatus);
router.delete('/:id', requireAdmin, deleteDetention);

module.exports = router;
