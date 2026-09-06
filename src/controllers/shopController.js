const db = require('../config/db');

// 1. Menampilkan Daftar Barang
const getItems = async (req, res) => {
    try {
        const items = [
            { 
                id: 1, 
                nama: "PDF Rangkuman Kosakata Kaigo", 
                harga: 50, 
                deskripsi: "Kumpulan kanji dan kosakata penting khusus alat bantu mobilitas Jitsumusha Kenshu.", 
                link_hadiah: "https://t.ly/contoh-pdf-kaigo" // Ganti dengan link rahasia Anda nanti
            },
            { 
                id: 2, 
                nama: "Wallpaper Motivasi HP", 
                harga: 20, 
                deskripsi: "Hiasi HP-mu dengan maskot tupai penyemangat dari KORISU Gakkou.", 
                link_hadiah: "https://t.ly/contoh-wallpaper"
            }
        ];
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat barang.' });
    }
};

// 2. Mesin Kasir (Proses Pembelian)
const buyItem = async (req, res) => {
    const murid_id = req.user.id; // Didapat dari token
    const { item_id, harga, nama_item, link_hadiah } = req.body;

    try {
        // Cek isi dompet murid di database
        const checkWallet = await db.query('SELECT koin_dimiliki FROM user_statistics WHERE murid_id = $1', [murid_id]);
        const koinSekarang = checkWallet.rows.length > 0 ? checkWallet.rows[0].koin_dimiliki : 0;

        // Jika koin kurang
        if (koinSekarang < harga) {
            return res.status(400).json({ message: 'Koin Tupai kamu belum cukup! Yuk rajin kuis lagi 🐿️' });
        }

        // Jika cukup, potong koinnya
        const sisaKoin = koinSekarang - harga;
        await db.query('UPDATE user_statistics SET koin_dimiliki = $1 WHERE murid_id = $2', [sisaKoin, murid_id]);

        // Berikan hadiahnya
        res.json({ 
            message: `Berhasil membeli ${nama_item}! 🎉`, 
            sisa_koin: sisaKoin,
            link: link_hadiah
        });

    } catch (error) {
        console.error('Error saat beli barang:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada mesin kasir server.' });
    }
};

module.exports = { getItems, buyItem };