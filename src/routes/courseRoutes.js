const express = require('express');
const router = express.Router();
const { getCourses } = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');

// Rute ini hanya bisa dibuka oleh murid yang memiliki tiket login yang sah
router.get('/', protect, getCourses);

module.exports = router;