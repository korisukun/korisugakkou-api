const db = require('../config/db');

// 1. Fungsi Menambah Barang ke Toko (Khusus Sensei/Admin)
const addShopItem = async (req, res) => {
    try {
        const { nama_item, tipe_item, harga_koin, image_url } = req.body;
        const newItem = await db.query(
            'INSERT INTO shop_items (nama_item, tipe_item, harga_koin, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [nama_item, tipe_item, harga_koin, image_url]
        );
        res.status(201).json({ message: 'Barang ditambahkan ke toko!', item: newItem.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah barang.' });
    }
};

// 2. Fungsi Murid Membeli Barang
const buyItem = async (req, res) => {
    try {
        const murid_id = req.user.id;
        const { item_id } = req.body;

        // Cek harga barang
        const itemRes = await db.query('SELECT * FROM shop_items WHERE id = $1', [item_id]);
        if (itemRes.rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
        const harga = itemRes.rows[0].harga_koin;

        // Cek saldo koin murid
        const dompetRes = await db.query('SELECT koin_dimiliki FROM user_statistics WHERE murid_id = $1', [murid_id]);
        const saldo = dompetRes.rows.length > 0 ? dompetRes.rows[0].koin_dimiliki : 0;

        if (saldo < harga) {
            return res.status(400).json({ message: 'Koin Tupai kamu tidak cukup! Rajin belajar lagi ya 🐿️' });
        }

        // Transaksi: Potong koin dan masukkan barang ke inventaris murid
        await db.query('UPDATE user_statistics SET koin_dimiliki = koin_dimiliki - $1 WHERE murid_id = $2', [harga, murid_id]);
        await db.query('INSERT INTO user_inventory (murid_id, item_id) VALUES ($1, $2)', [murid_id, item_id]);

        res.json({ message: 'Pembelian sukses! Item masuk ke tas kamu 🎒' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Transaksi gagal.' });
    }
};
// 3. Fungsi Melihat Semua Barang di Toko (Etalase)
const getAllItems = async (req, res) => {
    try {
        const itemsRes = await db.query('SELECT * FROM shop_items ORDER BY harga_koin ASC');
        res.json({ 
            message: 'Berhasil memuat toko', 
            data: itemsRes.rows 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memuat barang toko.' });
    }
};
// 4. Fungsi Melihat Saldo Koin Murid
const getSaldoMurid = async (req, res) => {
    try {
        const murid_id = req.user.id;
        const dompetRes = await db.query('SELECT koin_dimiliki, total_exp_points FROM user_statistics WHERE murid_id = $1', [murid_id]);
        
        const saldo = dompetRes.rows.length > 0 ? dompetRes.rows[0] : { koin_dimiliki: 0, total_exp_points: 0 };
        
        res.json({ message: 'Berhasil memuat saldo', data: saldo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memuat saldo.' });
    }
};

// PENTING: Update baris ekspor menjadi seperti ini:
module.exports = { addShopItem, buyItem, getAllItems, getSaldoMurid };