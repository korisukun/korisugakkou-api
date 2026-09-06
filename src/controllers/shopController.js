const db = require('../config/db');

// 1. Menampilkan Daftar Barang dari Tabel shop_items
const getItems = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM shop_items');
        res.status(200).json({ items: result.rows });
    } catch (error) {
        console.error('Error muat toko:', error.message);
        res.status(500).json({ message: 'Gagal memuat barang toko.' });
    }
};

// 2. Mesin Kasir (Proses Pemotongan Koin)
const buyItem = async (req, res) => {
    const murid_id = req.user.id;
    const { item_id, harga_koin, nama_item } = req.body;

    try {
        // Cek isi dompet murid
        const checkWallet = await db.query('SELECT koin_dimiliki FROM user_statistics WHERE murid_id = $1', [murid_id]);
        const koinSekarang = checkWallet.rows.length > 0 ? checkWallet.rows[0].koin_dimiliki : 0;

        // Validasi koin
        if (koinSekarang < harga_koin) {
            return res.status(400).json({ message: 'Koin Tupai kamu belum cukup! Yuk rajin kuis lagi 🐿️' });
        }

        // Potong koin
        const sisaKoin = koinSekarang - harga_koin;
        await db.query('UPDATE user_statistics SET koin_dimiliki = $1 WHERE murid_id = $2', [sisaKoin, murid_id]);

        // (Opsional: Di masa depan, di sini Anda bisa menambahkan logika INSERT ke tabel user_mascots)

        res.json({ 
            message: `Berhasil membeli ${nama_item}! 🎉`, 
            sisa_koin: sisaKoin 
        });

    } catch (error) {
        console.error('Error saat beli barang:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada mesin kasir server.' });
    }
};

module.exports = { getItems, buyItem };