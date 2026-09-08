const express = require('express');
const router = express.Router();
const { addQuote, getRandomQuote, getAllQuotes, editQuote, deleteQuote } = require('../controllers/quoteController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/random', protect, getRandomQuote);

// Rute CRUD Khusus Sensei
router.post('/add', protect, isSensei, addQuote);
router.get('/all', protect, isSensei, getAllQuotes); // Menarik semua data untuk Dropdown
router.put('/:id/edit', protect, isSensei, editQuote);
router.delete('/:id', protect, isSensei, deleteQuote);

module.exports = router;