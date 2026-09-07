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

// 2. Mesin Kasir (Proses Pemotongan Koin & Pemasangan Item)
const buyItem = async (req, res) => {
    const murid_id = req.user.id;
    const { item_id, harga_koin, nama_item } = req.body;

    try {
        const checkWallet = await db.query('SELECT koin_dimiliki FROM user_statistics WHERE murid_id = $1', [murid_id]);
        const koinSekarang = checkWallet.rows.length > 0 ? checkWallet.rows[0].koin_dimiliki : 0;

        if (koinSekarang < harga_koin) {
            return res.status(400).json({ message: 'Koin Tupai kamu belum cukup! Yuk rajin kuis lagi 🐿️' });
        }

        const itemData = await db.query('SELECT tipe_item FROM shop_items WHERE id = $1', [item_id]);
        if(itemData.rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan.' });
        
        const tipeItem = itemData.rows[0].tipe_item;
        const sisaKoin = koinSekarang - harga_koin;
        await db.query('UPDATE user_statistics SET koin_dimiliki = $1 WHERE murid_id = $2', [sisaKoin, murid_id]);

        const cekMaskot = await db.query('SELECT id FROM user_mascots WHERE murid_id = $1', [murid_id]);
        if (cekMaskot.rows.length === 0) {
            await db.query('INSERT INTO user_mascots (murid_id, level_mascot, status_mood) VALUES ($1, 1, 100)', [murid_id]);
        }

        if (tipeItem === 'aksesoris' || tipeItem === 'background') {
            await db.query('UPDATE user_mascots SET item_sedang_dipakai = $1 WHERE murid_id = $2', [item_id, murid_id]);
        } else if (tipeItem === 'makanan') {
            await db.query('UPDATE user_mascots SET status_mood = LEAST(status_mood + 20, 100) WHERE murid_id = $1', [murid_id]);
        }

        res.json({ 
            message: `Berhasil membeli ${nama_item}! 🎉 Cek maskotmu di Dashboard.`, 
            sisa_koin: sisaKoin 
        });

    } catch (error) {
        console.error('Error saat beli barang:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada mesin kasir server.' });
    }
};

// 3. Mengirim data Maskot ke Dashboard
const getMascot = async (req, res) => {
    const murid_id = req.user.id;
    try {
        const mascotResult = await db.query(`
            SELECT m.level_mascot, m.status_mood, s.nama_item, s.image_url 
            FROM user_mascots m 
            LEFT JOIN shop_items s ON m.item_sedang_dipakai = s.id 
            WHERE m.murid_id = $1
        `, [murid_id]);

        if (mascotResult.rows.length > 0) {
            const data = mascotResult.rows[0];
            res.json({
                mascot: {
                    level_mascot: data.level_mascot,
                    status_mood: data.status_mood,
                    item_dipakai: data.nama_item ? { nama_item: data.nama_item, image_url: data.image_url } : null
                }
            });
        } else {
            res.json({ mascot: { level_mascot: 1, status_mood: 100, item_dipakai: null } });
        }
    } catch (error) {
        console.error('Error memuat maskot:', error.message);
        res.status(500).json({ message: 'Gagal memuat data maskot.' });
    }
};

// 4. [BARU] Menambah Item Toko Baru (Khusus Sensei)
const addItem = async (req, res) => {
    const { nama_item, tipe_item, harga_koin, image_url } = req.body;
    
    try {
        await db.query(
            'INSERT INTO shop_items (nama_item, tipe_item, harga_koin, image_url) VALUES ($1, $2, $3, $4)',
            [nama_item, tipe_item, harga_koin, image_url]
        );
        res.status(201).json({ message: 'Item berhasil ditambahkan ke etalase! 🏪' });
    } catch (error) {
        console.error('Error tambah item toko:', error.message);
        res.status(500).json({ message: 'Gagal menambah item ke database.' });
    }
};

module.exports = { getItems, buyItem, getMascot, addItem };