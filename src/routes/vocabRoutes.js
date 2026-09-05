const express = require('express');
const router = express.Router();
const { createCategory, createVocab } = require('../controllers/vocabController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Hanya Sensei yang boleh menambah database kosakata
router.post('/category', protect, isSensei, createCategory);
router.post('/word', protect, isSensei, createVocab);

module.exports = router;