const express = require('express');
const router = express.Router();
const { addVocabulary } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Rute ini dijaga ketat: Harus punya token (protect) DAN harus berstatus sensei
router.post('/add', protect, isSensei, addVocabulary);

module.exports = router;