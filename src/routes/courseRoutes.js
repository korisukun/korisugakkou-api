const express = require('express');
const router = express.Router();
// Tambahkan getCourseDetail ke dalam impor
const { createCourse, getAllCourses, getCourseDetail } = require('../controllers/courseController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Endpoint melihat semua kelas
router.get('/', getAllCourses);

// Endpoint melihat 1 kelas spesifik BESERTA isi videonya
router.get('/:id', getCourseDetail);

// Endpoint membuat kelas baru
router.post('/', protect, isSensei, createCourse);

module.exports = router;