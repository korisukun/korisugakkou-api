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

// 2. Mesin Kasir (Pemotongan Koin & Masuk Tas Inventori)
const buyItem = async (req, res) => {
    const murid_id = req.user.id;
    const { item_id, harga_koin, nama_item } = req.body;

    try {
        // Cek saldo koin langsung dari tabel user_statistics
        const checkWallet = await db.query('SELECT koin_dimiliki FROM user_statistics WHERE murid_id = $1', [murid_id]);
        const koinSekarang = checkWallet.rows.length > 0 ? parseInt(checkWallet.rows[0].koin_dimiliki) : 0;

        // Validasi kecukupan koin
        if (koinSekarang < parseInt(harga_koin)) {
            return res.status(400).json({ message: 'Koin Tupai kamu belum cukup! Yuk rajin kuis lagi 🐿️' });
        }

        // Cek validitas barang
        const itemData = await db.query('SELECT tipe_item FROM shop_items WHERE id = $1', [item_id]);
        if(itemData.rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan.' });
        
        const tipeItem = itemData.rows[0].tipe_item;
        
        // Potong koin dengan teknik UPSERT (Tabel ini punya kunci UNIQUE, jadi aman)
        const sisaKoin = koinSekarang - parseInt(harga_koin);
        await db.query(`
            INSERT INTO user_statistics (murid_id, koin_dimiliki) 
            VALUES ($1, $2) 
            ON CONFLICT (murid_id) 
            DO UPDATE SET koin_dimiliki = EXCLUDED.koin_dimiliki
        `, [murid_id, sisaKoin]);

        // [PERBAIKAN] Cek kepemilikan maskot secara manual karena tidak ada constraint UNIQUE di ERD
        const cekMaskot = await db.query('SELECT id FROM user_mascots WHERE murid_id = $1', [murid_id]);
        if (cekMaskot.rows.length === 0) {
            await db.query(`
                INSERT INTO user_mascots (murid_id, level_mascot, status_mood) 
                VALUES ($1, 1, 100)
            `, [murid_id]);
        }

        // Proses Distribusi Barang berdasarkan Tipe Item
        if (tipeItem === 'aksesoris' || tipeItem === 'background') {
            await db.query('INSERT INTO user_items (murid_id, item_id) VALUES ($1, $2)', [murid_id, item_id]);
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

// 3. Mengirim data Maskot & Isi Tas Inventori ke Dashboard
const getMascot = async (req, res) => {
    const murid_id = req.user.id;
    try {
        const mascotResult = await db.query('SELECT level_mascot, status_mood FROM user_mascots WHERE murid_id = $1', [murid_id]);
        let mascot = mascotResult.rows.length > 0 ? mascotResult.rows[0] : { level_mascot: 1, status_mood: 100 };

        const itemsRes = await db.query(`
            SELECT s.nama_item, s.image_url 
            FROM user_items ui
            JOIN shop_items s ON ui.item_id = s.id
            WHERE ui.murid_id = $1 AND s.tipe_item = 'aksesoris'
        `, [murid_id]);

        mascot.items_dipakai = itemsRes.rows;

        res.json({ mascot });
    } catch (error) {
        console.error('Error memuat maskot:', error.message);
        res.status(500).json({ message: 'Gagal memuat data maskot.' });
    }
};

// 4. Menambah Item Toko Baru
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