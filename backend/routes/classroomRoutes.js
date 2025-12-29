const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteClassroom
} = require('../controllers/classroomController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, deleteClassroom);

module.exports = router;
