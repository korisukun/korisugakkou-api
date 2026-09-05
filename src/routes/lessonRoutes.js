const express = require('express');
const router = express.Router();
const { createModule, createLesson } = require('../controllers/lessonController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Endpoint untuk membuat Bab/Modul baru
router.post('/module', protect, isSensei, createModule);

// Endpoint untuk menambah Video Materi baru
router.post('/video', protect, isSensei, createLesson);

module.exports = router;