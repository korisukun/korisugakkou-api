const db = require('../config/db');

// 1. Membuat Kategori (Misal: "Kaigo Kokka Shiken")
const createCategory = async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body;
        const newCat = await db.query(
            'INSERT INTO vocabulary_categories (nama_kategori, deskripsi) VALUES ($1, $2) RETURNING *',
            [nama_kategori, deskripsi]
        );
        res.status(201).json({ message: 'Kategori berhasil dibuat', kategori: newCat.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat kategori.' });
    }
};

// 2. Memasukkan Kosakata dan Menghubungkannya ke Kategori
const createVocab = async (req, res) => {
    try {
        const { kanji, furigana, arti_indonesia, category_id } = req.body;

        // Masukkan ke tabel master kosakata
        const newVocab = await db.query(
            'INSERT INTO vocabularies (kanji, furigana, arti_indonesia) VALUES ($1, $2, $3) RETURNING *',
            [kanji, furigana, arti_indonesia]
        );
        const vocabId = newVocab.rows[0].id;

        // Hubungkan dengan kategori di tabel pivot (Many-to-Many)
        if (category_id) {
            await db.query(
                'INSERT INTO vocab_category_mapping (vocab_id, category_id) VALUES ($1, $2)',
                [vocabId, category_id]
            );
        }

        res.status(201).json({ 
            message: 'Kosakata berhasil ditambahkan ke Bank! 📖', 
            vocab: newVocab.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambah kosakata.' });
    }
};

module.exports = { createCategory, createVocab };