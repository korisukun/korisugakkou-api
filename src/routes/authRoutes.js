const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Endpoint untuk registrasi
router.post('/register', register);

// Endpoint untuk login
router.post('/login', login);

module.exports = router;