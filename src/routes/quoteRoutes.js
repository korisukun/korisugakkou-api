const express = require('express');
const router = express.Router();
const { addQuote, getRandomQuote } = require('../controllers/quoteController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/random', protect, getRandomQuote);
router.post('/add', protect, isSensei, addQuote);

module.exports = router;