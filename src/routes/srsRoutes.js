const express = require('express');
const router = express.Router();
const { getTodayReviews, submitReview } = require('../controllers/srsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/today', protect, getTodayReviews);
router.post('/submit', protect, submitReview);

module.exports = router;