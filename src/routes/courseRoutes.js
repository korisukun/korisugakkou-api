const express = require('express');
const router = express.Router();

const { getAllCourses, getCourseCurriculum, enrollCourse, addCourse } = require('../controllers/courseController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllCourses); 
router.get('/:id', protect, getCourseCurriculum); 
router.post('/:id/enroll', protect, enrollCourse); 

// [BARU] Rute untuk menambah kelas (Khusus Sensei)
router.post('/add', protect, isSensei, addCourse); 

module.exports = router;