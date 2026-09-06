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

module.exports = { addVocabulary, addBulkVocabulary };