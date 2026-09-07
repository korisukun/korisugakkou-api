const db = require('../config/db');

// 1. Menambah Kosakata Masal (Bulk Add)
const addVocabBulk = async (req, res) => {
    const { vocabularies, course_id } = req.body;
    
    if (!vocabularies || vocabularies.length === 0) {
        return res.status(400).json({ message: 'Data kosakata kosong.' });
    }

    try {
        // Menyisipkan array kosakata satu per satu ke database
        for (const v of vocabularies) {
            await db.query(
                'INSERT INTO vocabularies (course_id, kanji, furigana, arti_indonesia) VALUES ($1, $2, $3, $4)',
                [course_id, v.kanji, v.furigana, v.arti_indonesia]
            );
        }
        res.status(201).json({ message: 'Semua Kosakata berhasil disimpan ke database! 📚' });
    } catch (error) {
        console.error('Error tambah kosakata masal:', error.message);
        res.status(500).json({ message: `Gagal: ${error.message}` });
    }
};

// 2. Mengambil Daftar Kosakata Berdasarkan Kelas (Untuk Dropdown Edit)
const getVocabsByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const result = await db.query('SELECT * FROM vocabularies WHERE course_id = $1 ORDER BY id ASC', [course_id]);
        res.json({ vocabularies: result.rows });
    } catch (error) { 
        res.status(500).json({ message: 'Gagal memuat kosakata.' }); 
    }
};

// 3. Menyimpan Perubahan Edit Kosakata
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

// Pastikan ketiga nama ini persis diekspor
module.exports = { addVocabBulk, getVocabsByCourse, editVocab };