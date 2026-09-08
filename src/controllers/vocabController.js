const db = require('../config/db');

// 1. Menambah Kosakata Masal (Bulk Add) & Distribusi ke Murid Lama
const addVocabBulk = async (req, res) => {
    const { vocabularies, course_id } = req.body;
    
    if (!vocabularies || vocabularies.length === 0) {
        return res.status(400).json({ message: 'Data kosakata kosong.' });
    }

    try {
        // A. Cari tahu siapa saja murid yang sudah terlanjur mengikuti kelas ini
        let enrolledUsers = [];
        try {
            // Mencoba mencari dari tabel pendaftaran resmi
            const enrollRes = await db.query('SELECT user_id FROM enrollments WHERE course_id = $1', [course_id]);
            enrolledUsers = enrollRes.rows.map(r => r.user_id);
        } catch (err) {
            // Fallback (Penyelamat): Jika tabel enrollments beda nama, cari murid dari tabel SRS eksisting
            const srsRes = await db.query(
                'SELECT DISTINCT murid_id FROM srs_reviews sr JOIN vocabularies v ON sr.vocab_id = v.id WHERE v.course_id = $1', 
                [course_id]
            );
            enrolledUsers = srsRes.rows.map(r => r.murid_id);
        }

        // B. Menyisipkan kosakata ke tabel master dan mendistribusikannya ke antrean murid
        for (const v of vocabularies) {
            
            // 1. Simpan ke master vocabularies dan ambil ID barunya (RETURNING id)
            const vocabRes = await db.query(
                'INSERT INTO vocabularies (course_id, kanji, furigana, arti_indonesia) VALUES ($1, $2, $3, $4) RETURNING id',
                [course_id, v.kanji, v.furigana, v.arti_indonesia]
            );
            const newVocabId = vocabRes.rows[0].id;

            // 2. Suntikkan ke jadwal SRS murid lama untuk ke-6 arah kuis
            if (enrolledUsers.length > 0) {
                for (const muridId of enrolledUsers) {
                    for (let arah = 1; arah <= 6; arah++) {
                        try {
                            // [PERBAIKAN KURSUS]: Menambahkan CURRENT_TIMESTAMP agar langsung masuk antrean hari ini!
                            await db.query(
                                'INSERT INTO srs_reviews (murid_id, vocab_id, arah_kuis, next_review_date) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
                                [muridId, newVocabId, arah]
                            );
                        } catch (duplicateErr) {
                            // Abaikan diam-diam jika kosakata ini kebetulan sudah masuk
                        }
                    }
                }
            }
        }
        
        res.status(201).json({ message: 'Semua Kosakata berhasil disimpan & siap direview murid! 📚' });
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

// 4. Menghapus Kosakata
const deleteVocab = async (req, res) => {
    try {
        await db.query('DELETE FROM vocabularies WHERE id = $1', [req.params.id]);
        res.json({ message: 'Kosakata berhasil dihapus! 🗑️' });
    } catch (error) { 
        res.status(500).json({ message: `Gagal: ${error.message}` }); 
    }
};

module.exports = { addVocabBulk, getVocabsByCourse, editVocab, deleteVocab };