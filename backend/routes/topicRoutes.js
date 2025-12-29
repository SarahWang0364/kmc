const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteTopic
} = require('../controllers/topicController');
const { requireAuth, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireTeacher, create);
router.put('/:id', requireTeacher, update);
router.delete('/:id', requireAdmin, deleteTopic);

module.exports = router;
