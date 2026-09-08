const express = require('express');
const router = express.Router();
const { addVocabBulk, getVocabsByCourse, editVocab, deleteVocab } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.post('/bulk-add', protect, isSensei, addVocabBulk);
router.get('/course/:course_id', protect, isSensei, getVocabsByCourse);
router.put('/:id/edit', protect, isSensei, editVocab);
router.delete('/:id', protect, isSensei, deleteVocab);

module.exports = router;