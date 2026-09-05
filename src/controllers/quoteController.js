const db = require('../config/db');

// 1. Sensei Menambah Quote Baru ke Database
const addQuote = async (req, res) => {
    try {
        const { teks_jepang, cara_baca, arti_indonesia, sumber_tokoh, kategori_fokus } = req.body;
        
        console.log("--> Menerima request tambah quote:", teks_jepang);

        const newQuote = await db.query(
            'INSERT INTO study_quotes (teks_jepang, cara_baca, arti_indonesia, sumber_tokoh, kategori_fokus) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [teks_jepang, cara_baca, arti_indonesia, sumber_tokoh, kategori_fokus]
        );
        
        console.log("--> Quote sukses masuk database!");
        res.status(201).json({ message: 'Quote motivasi berhasil ditambahkan! 🌸', quote: newQuote.rows[0] });
        
    } catch (error) {
        // INI SENTER PELACAK UTAMANYA:
        console.error('>>> ERROR DATABASE QUOTE:', error.message);
        res.status(500).json({ message: 'Gagal menambah quote.' });
    }
};

// 2. Sistem Menarik 1 Quote Acak untuk Murid
const getRandomQuote = async (req, res) => {
    try {
        const { kategori } = req.query; 
        
        let queryStr = 'SELECT * FROM study_quotes';
        let params = [];

        if (kategori) {
            queryStr += ' WHERE kategori_fokus = $1';
            params.push(kategori);
        }
        
        queryStr += ' ORDER BY RANDOM() LIMIT 1';

        const quoteRes = await db.query(queryStr, params);
        
        if(quoteRes.rows.length === 0) {
            return res.status(404).json({ message: 'Belum ada quote untuk kategori ini.' });
        }

        res.json({ quote: quoteRes.rows[0] });
    } catch (error) {
        console.error('>>> ERROR AMBIL QUOTE:', error.message);
        res.status(500).json({ message: 'Gagal mengambil quote.' });
    }
};

module.exports = { addQuote, getRandomQuote };