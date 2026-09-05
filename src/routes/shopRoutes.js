const express = require('express');
const router = express.Router();
const { addShopItem, buyItem, getAllItems, getSaldoMurid } = require('../controllers/shopController');
const { protect, isSensei } = require('../middlewares/authMiddleware');

// Endpoint melihat isi toko
router.get('/saldo', protect, getSaldoMurid);
router.get('/', protect, getAllItems);

// Admin menaruh barang di toko
router.post('/add', protect, isSensei, addShopItem);

// Murid membeli barang
router.post('/buy', protect, buyItem);

module.exports = router;