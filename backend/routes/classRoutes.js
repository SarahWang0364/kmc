const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  markAttendance,
  gradeHomework,
  enterTestMarks,
  addStudent,
  removeStudent,
  getTodaysClasses,
  delete: deleteClass
} = require('../controllers/classController');
const { requireAuth, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getAll);
router.get('/today', getTodaysClasses);
router.get('/:id', getById);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);

// Class operations
router.post('/:id/attendance', requireTeacher, markAttendance);
router.post('/:id/homework', requireTeacher, gradeHomework);
router.post('/:id/test-marks', requireTeacher, enterTestMarks);
router.post('/:id/students', requireAdmin, addStudent);
router.delete('/:id/students/:studentId', requireAdmin, removeStudent);

router.delete('/:id', requireAdmin, deleteClass);

module.exports = router;
