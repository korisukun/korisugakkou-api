const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Endpoint untuk update profil (Harus login / terproteksi)
router.put('/profile', protect, updateProfile);

module.exports = router;