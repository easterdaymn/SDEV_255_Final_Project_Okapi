const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const scheduleController = require('../controllers/scheduleController');

// Rendering the /students page
router.get('/students', authMiddleware.requireAuth, scheduleController.renderStudentsPage);

// Adding a course
router.post('/add/:id', authMiddleware.requireAuth, scheduleController.addToSchedule);

// Dropping a course
router.post('/drop/:id', authMiddleware.requireAuth, scheduleController.removeFromSchedule);

module.exports = router;
