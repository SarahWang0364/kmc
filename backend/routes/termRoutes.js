const express = require('express');
const router = express.Router();
const {
  getAll,
  getCurrent,
  getCurrentWeek,
  getById,
  create,
  update,
  delete: deleteTerm
} = require('../controllers/termController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/current-week', getCurrentWeek);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, deleteTerm);

module.exports = router;
