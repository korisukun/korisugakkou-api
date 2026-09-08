const express = require('express');
const router = express.Router();
const { getItems, buyItem, addItem } = require('../controllers/shopController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/items', protect, getItems);
router.post('/buy', protect, buyItem);
router.post('/add', protect, isSensei, addItem);

module.exports = router;