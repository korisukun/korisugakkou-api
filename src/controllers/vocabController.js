const db = require('../config/db');

// Fungsi 1: Menambah Kosakata Satuan (Masih dipertahankan untuk jaga-jaga)
const addVocabulary = async (req, res) => {
    try {
        const { kanji, furigana, arti_indonesia, kategori } = req.body;
        const newVocab = await db.query(
            'INSERT INTO vocabularies (kanji, furigana, arti_indonesia, kategori) VALUES ($1, $2, $3, $4) RETURNING *',
            [kanji, furigana, arti_indonesia, kategori || 'umum']
        );
        res.status(201).json({ message: 'Kosakata baru berhasil ditambahkan! 🐿️', vocab: newVocab.rows[0] });
    } catch (error) {
        console.error('Error saat menambah kosakata:', error.message);
        res.status(500).json({ message: 'Gagal menambah kosakata pada server.' });
    }
};

// Fungsi 2: [BARU] Menambah Ratusan Kosakata Sekaligus (Bulk Insert)
const addBulkVocabulary = async (req, res) => {
    try {
        const { vocabularies } = req.body; // Menerima array dari frontend
        
        if (!Array.isArray(vocabularies) || vocabularies.length === 0) {
            return res.status(400).json({ message: 'Data kosong atau format salah.' });
        }

        let berhasil = 0;
        
        // Memasukkan data satu per satu ke database dengan cepat
        for (let v of vocabularies) {
            await db.query(
                'INSERT INTO vocabularies (kanji, furigana, arti_indonesia, kategori) VALUES ($1, $2, $3, $4)',
                [v.kanji, v.furigana, v.arti_indonesia, v.kategori || 'umum']
            );
            berhasil++;
        }

        res.status(201).json({ message: `Luar biasa! ${berhasil} Kosakata berhasil ditambahkan sekaligus! 🚀` });
        
    } catch (error) {
        console.error('Bulk insert error:', error.message);
        res.status(500).json({ message: 'Gagal menambah kosakata masal. Cek format penulisan Anda.' });
    }
};

module.exports = { addVocabulary, addBulkVocabulary };