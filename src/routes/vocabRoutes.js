const express = require('express');
const router = express.Router();

const { addVocabBulk, getVocabsByCourse, editVocab } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Rute Tambah Masal
router.post('/bulk-add', protect, isSensei, addVocabBulk);

// Rute untuk Fitur Edit Cepat Kosakata
router.get('/course/:course_id', protect, isSensei, getVocabsByCourse);
router.put('/:id/edit', protect, isSensei, editVocab);

module.exports = router;