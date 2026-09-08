const db = require('../config/db');

// 1. Menambah Kosakata Masal (Bulk Add) & Distribusi ke Murid Lama
const addVocabBulk = async (req, res) => {
    const { vocabularies, course_id } = req.body;
    
    if (!vocabularies || vocabularies.length === 0) {
        return res.status(400).json({ message: 'Data kosakata kosong.' });
    }

    try {
        // A. Mencari murid yang terdaftar (Mengecek semua kemungkinan struktur tabel)
        let enrolledUsers = [];
        const queriesToTry = [
            'SELECT user_id AS id FROM course_enrollments WHERE course_id = $1',
            'SELECT murid_id AS id FROM course_enrollments WHERE course_id = $1',
            'SELECT user_id AS id FROM enrollments WHERE course_id = $1',
            'SELECT murid_id AS id FROM enrollments WHERE course_id = $1',
            'SELECT DISTINCT murid_id AS id FROM srs_reviews sr JOIN vocabularies v ON sr.vocab_id = v.id WHERE v.course_id = $1'
        ];

        for (let q of queriesToTry) {
            try {
                const result = await db.query(q, [course_id]);
                if (result.rows.length > 0) {
                    enrolledUsers = result.rows.map(r => r.id);
                    break; 
                }
            } catch (e) { /* Abaikan jika tabel tidak cocok */ }
        }

        // B. Menyisipkan kosakata ke tabel master dan mendistribusikannya
        for (const v of vocabularies) {
            // 1. Simpan ke master vocabularies
            const vocabRes = await db.query(
                'INSERT INTO vocabularies (course_id, kanji, furigana, arti_indonesia) VALUES ($1, $2, $3, $4) RETURNING id',
                [course_id, v.kanji, v.furigana, v.arti_indonesia]
            );
            const newVocabId = vocabRes.rows[0].id;

            // 2. Suntikkan ke jadwal SRS murid lama dengan nilai default eksplisit
            if (enrolledUsers.length > 0) {
                for (const muridId of enrolledUsers) {
                    for (let arah = 1; arah <= 6; arah++) {
                        try {
                            await db.query(
                                `INSERT INTO srs_reviews 
                                (murid_id, vocab_id, arah_kuis, srs_level, total_review, avg_waktu_detik, kategori_terakhir, next_review_date) 
                                VALUES ($1, $2, $3, 0, 0, 0, 'again', CURRENT_TIMESTAMP)`,
                                [muridId, newVocabId, arah]
                            );
                        } catch (insertErr) {
                            // Abaikan hanya jika benar-benar duplikat
                        }
                    }
                }
            }
        }
        
        res.status(201).json({ message: 'Semua Kosakata berhasil disimpan & siap direview! 📚' });
    } catch (error) {
        console.error('Error tambah kosakata masal:', error.message);
        res.status(500).json({ message: `Gagal: ${error.message}` });
    }
};

// 2. Mengambil Daftar Kosakata Berdasarkan Kelas
const getVocabsByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const result = await db.query('SELECT * FROM vocabularies WHERE course_id = $1 ORDER BY id ASC', [course_id]);
        res.json({ vocabularies: result.rows });
    } catch (error) { res.status(500).json({ message: 'Gagal memuat kosakata.' }); }
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
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

// 4. Menghapus Kosakata
const deleteVocab = async (req, res) => {
    try {
        await db.query('DELETE FROM vocabularies WHERE id = $1', [req.params.id]);
        res.json({ message: 'Kosakata berhasil dihapus! 🗑️' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

module.exports = { addVocabBulk, getVocabsByCourse, editVocab, deleteVocab };