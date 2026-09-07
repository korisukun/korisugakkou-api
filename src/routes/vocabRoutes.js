const express = require('express');
const router = express.Router();

// ⚠️ PERBAIKAN: Pastikan getVocabsByCourse dan editVocab ikut dipanggil di sini
const { addVocabBulk, getVocabsByCourse, editVocab } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Rute yang sudah ada
router.post('/bulk-add', protect, isSensei, addVocabBulk);

// Rute Baru untuk Fitur Edit Cepat Kosakata
router.get('/course/:course_id', protect, isSensei, getVocabsByCourse);
router.put('/:id/edit', protect, isSensei, editVocab);

module.exports = router;