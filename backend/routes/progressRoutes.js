const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  updateWeekContent,
  delete: deleteProgress
} = require('../controllers/progressController');
const { requireAuth, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.patch('/:id/week/:week', requireTeacher, updateWeekContent);
router.delete('/:id', requireAdmin, deleteProgress);

module.exports = router;
