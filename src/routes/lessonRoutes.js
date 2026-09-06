const express = require('express');
const router = express.Router();
const { getLesson, completeLesson } = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:id', protect, getLesson);
router.post('/:id/complete', protect, completeLesson);

module.exports = router;