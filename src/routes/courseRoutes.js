const express = require('express');
const router = express.Router();

const { getAllCourses, getCourseCurriculum, enrollCourse, addCourse, addModule, getModulesByCourse, addLesson, getLessonsByModule, editModule, editLesson } = require('../controllers/courseController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllCourses); 

// Rute Tambah Data (Khusus Sensei)
router.post('/add', protect, isSensei, addCourse); 
router.post('/modules/add', protect, isSensei, addModule);
router.post('/lessons/add', protect, isSensei, addLesson);

// Rute Mengambil Data untuk Dropdown (Khusus Sensei)
router.get('/:id/modules', protect, isSensei, getModulesByCourse);
router.get('/modules/:id/lessons', protect, isSensei, getLessonsByModule);

// Rute Edit Data (Khusus Sensei)
router.put('/modules/:id/edit', protect, isSensei, editModule);
router.put('/lessons/:id/edit', protect, isSensei, editLesson);

// Rute Spesifik Kelas (Murid)
router.get('/:id', protect, getCourseCurriculum); 
router.post('/:id/enroll', protect, enrollCourse); 

module.exports = router;