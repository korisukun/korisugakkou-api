const db = require('../config/db');

const addVocabulary = async (req, res) => {
    try {
        const { kanji, furigana, arti_indonesia } = req.body;
        
        // Memasukkan data ke tabel vocabularies
        const newVocab = await db.query(
            'INSERT INTO vocabularies (kanji, furigana, arti_indonesia) VALUES ($1, $2, $3) RETURNING *',
            [kanji, furigana, arti_indonesia]
        );
        
        res.status(201).json({ 
            message: 'Kosakata Kaigo berhasil ditambahkan! 🐿️', 
            vocab: newVocab.rows[0] 
        });
    } catch (error) {
        console.error('Error saat menambah kosakata:', error.message);
        res.status(500).json({ message: 'Gagal menambah kosakata pada server.' });
    }
};

module.exports = { addVocabulary };