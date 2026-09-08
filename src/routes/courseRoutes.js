const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseCurriculum, enrollCourse, addCourse, addModule, getModulesByCourse, addLesson, getLessonsByModule, editModule, editLesson, editCourse, deleteCourse, deleteModule, deleteLesson } = require('../controllers/courseController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Akses Murid & Publik
router.get('/', protect, getAllCourses); 
router.get('/:id', protect, getCourseCurriculum); 
router.post('/:id/enroll', protect, enrollCourse); 

// Akses Khusus Sensei (CRUD)
router.post('/add', protect, isSensei, addCourse); 
router.post('/modules/add', protect, isSensei, addModule);
router.post('/lessons/add', protect, isSensei, addLesson);

router.get('/:id/modules', protect, isSensei, getModulesByCourse);
router.get('/modules/:id/lessons', protect, isSensei, getLessonsByModule);

router.put('/:id/edit', protect, isSensei, editCourse);
router.put('/modules/:id/edit', protect, isSensei, editModule);
router.put('/lessons/:id/edit', protect, isSensei, editLesson);

router.delete('/:id', protect, isSensei, deleteCourse);
router.delete('/modules/:id', protect, isSensei, deleteModule);
router.delete('/lessons/:id', protect, isSensei, deleteLesson);

module.exports = router;