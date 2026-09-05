const express = require('express');
const router = express.Router();
const { addQuote, getRandomQuote } = require('../controllers/quoteController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Menarik quote acak (Bisa diakses murid setelah login)
router.get('/random', protect, getRandomQuote);

// Menambah quote baru (Hanya Sensei)
router.post('/add', protect, isSensei, addQuote);

module.exports = router;