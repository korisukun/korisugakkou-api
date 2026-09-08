const express = require('express');
const router = express.Router();
const { getItems, buyItem, addItem, editShopItem, deleteShopItem } = require('../controllers/shopController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

router.get('/items', protect, getItems);
router.post('/buy', protect, buyItem);

// Rute CRUD Khusus Sensei
router.post('/add', protect, isSensei, addItem);
router.put('/:id/edit', protect, isSensei, editShopItem);
router.delete('/:id', protect, isSensei, deleteShopItem);

module.exports = router;