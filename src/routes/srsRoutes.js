const express = require('express');
const router = express.Router();

// ⚠️ Memanggil nama fungsi yang baru dari srsController
const { getTodayReviews, submitReview } = require('../controllers/srsController');
const { protect } = require('../middlewares/authMiddleware');

// Rute untuk mengecek antrean kuis hari ini (mendukung filter ?course_id=)
router.get('/today', protect, getTodayReviews);

// Rute untuk mengirimkan hasil jawaban kuis
router.post('/submit', protect, submitReview);

module.exports = router;