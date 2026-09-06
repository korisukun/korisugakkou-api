const express = require('express');
const router = express.Router();
// Pastikan addBulkVocabulary ikut diimpor
const { addVocabulary, addBulkVocabulary } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.post('/add', protect, isSensei, addVocabulary);

// [BARU] Rute untuk menangkap data masal
router.post('/bulk-add', protect, isSensei, addBulkVocabulary);

module.exports = router;