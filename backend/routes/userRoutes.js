const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStaff,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser
} = require('../controllers/userController');
const { requireAuth, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// Student routes
router.get('/students', requireTeacher, getStudents);

// Staff routes
router.get('/staff', requireAdmin, getStaff);

// User CRUD routes
router.get('/:id', requireAuth, getUser);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAuth, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

// User activation routes
router.patch('/:id/deactivate', requireAdmin, deactivateUser);
router.patch('/:id/reactivate', requireAdmin, reactivateUser);

module.exports = router;
