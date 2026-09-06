const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseCurriculum } = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllCourses); // Menampilkan semua kelas
router.get('/:id', protect, getCourseCurriculum); // Menampilkan 1 kurikulum kelas

// [BARU] Rute untuk menekan tombol Ikuti Kelas
router.post('/:id/enroll', protect, enrollCourse); 

module.exports = router;