const express = require('express');
const router = express.Router();

// PERBAIKAN FATAL ADA DI BARIS INI: 
// Pastikan "enrollCourse" ikut tertulis di dalam kurung kurawal agar bisa digunakan
const { getAllCourses, getCourseCurriculum, enrollCourse } = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllCourses); 
router.get('/:id', protect, getCourseCurriculum); 

// Rute untuk menekan tombol Ikuti Kelas
router.post('/:id/enroll', protect, enrollCourse); 

module.exports = router;