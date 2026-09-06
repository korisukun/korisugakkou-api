const express = require('express');
const router = express.Router();
const { getItems, buyItem } = require('../controllers/shopController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/items', protect, getItems);
router.post('/buy', protect, buyItem);

module.exports = router;