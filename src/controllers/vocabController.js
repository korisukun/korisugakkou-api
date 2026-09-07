const db = require('../config/db');

// 1. Menambah Kosakata Satuan
const addVocabulary = async (req, res) => {
    try {
        const { kanji, furigana, arti_indonesia, course_id } = req.body;
        const newVocab = await db.query(
            'INSERT INTO vocabularies (kanji, furigana, arti_indonesia, course_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [kanji, furigana, arti_indonesia, course_id || null]
        );
        res.status(201).json({ message: 'Kosakata berhasil ditambahkan! 🐿️', vocab: newVocab.rows[0] });
    } catch (error) {
        console.error('Error saat menambah kosakata:', error.message);
        res.status(500).json({ message: 'Gagal menambah kosakata pada server.' });
    }
};

// 2. Menambah Ratusan Kosakata Sekaligus (Bulk Insert)
const addBulkVocabulary = async (req, res) => {
    try {
        const { vocabularies, course_id } = req.body; 
        
        if (!Array.isArray(vocabularies) || vocabularies.length === 0) {
            return res.status(400).json({ message: 'Data kosong atau format salah.' });
        }

        let berhasil = 0;
        
        for (let v of vocabularies) {
            await db.query(
                'INSERT INTO vocabularies (kanji, furigana, arti_indonesia, course_id) VALUES ($1, $2, $3, $4)',
                [v.kanji, v.furigana, v.arti_indonesia, course_id || null]
            );
            berhasil++;
        }

        res.status(201).json({ message: `Luar biasa! ${berhasil} Kosakata berhasil dimasukkan ke katalog! 🚀` });
        
    } catch (error) {
        console.error('Bulk insert error:', error.message);
        res.status(500).json({ message: 'Gagal menambah kosakata masal.' });
    }
};

// Mengambil Daftar Kosakata Berdasarkan Kelas (Untuk Dropdown Edit)
const getVocabsByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const result = await db.query('SELECT * FROM vocabularies WHERE course_id = $1 ORDER BY id ASC', [course_id]);
        res.json({ vocabularies: result.rows });
    } catch (error) { 
        res.status(500).json({ message: 'Gagal memuat kosakata.' }); 
    }
};

// Menyimpan Perubahan Edit Kosakata
const editVocab = async (req, res) => {
    const { id } = req.params;
    const { kanji, furigana, arti_indonesia } = req.body;
    try {
        await db.query(
            'UPDATE vocabularies SET kanji = $1, furigana = $2, arti_indonesia = $3 WHERE id = $4', 
            [kanji, furigana, arti_indonesia, id]
        );
        res.json({ message: 'Kosakata berhasil diperbarui! ✅' });
    } catch (error) { 
        res.status(500).json({ message: `Gagal: ${error.message}` }); 
    }
};

// Pastikan untuk mengekspor kedua fungsi baru ini di baris paling bawah module.exports

module.exports = { addVocabulary, addBulkVocabulary, getVocabsByCourse, editVocab };