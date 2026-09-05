const express = require('express');
const router = express.Router();
// Tambahkan getTodayReviews ke dalam impor
const { submitAnswer, getTodayReviews } = require('../controllers/srsController');
const { protect } = require('../middlewares/authMiddleware');

// Endpoint mengambil daftar antrean HARI INI
router.get('/today', protect, getTodayReviews);

// Endpoint mengirim jawaban
router.post('/submit', protect, submitAnswer);

module.exports = router;