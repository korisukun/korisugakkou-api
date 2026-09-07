const express = require('express');
const router = express.Router();

const { getAllCourses, getCourseCurriculum, enrollCourse, addCourse, addModule, getModulesByCourse, addLesson } = require('../controllers/courseController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllCourses); 

// Rute Tambah Data (Khusus Sensei) - Harus diletakkan di atas rute /:id
router.post('/add', protect, isSensei, addCourse); 
router.post('/modules/add', protect, isSensei, addModule);
router.post('/lessons/add', protect, isSensei, addLesson);
router.get('/:id/modules', protect, isSensei, getModulesByCourse);

// Rute Spesifik Kelas
router.get('/:id', protect, getCourseCurriculum); 
router.post('/:id/enroll', protect, enrollCourse); 

module.exports = router;