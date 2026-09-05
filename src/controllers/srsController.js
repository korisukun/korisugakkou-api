const db = require('../config/db');

// Array urutan interval hari. Index = Level SRS.
// Contoh: Level 3 artinya 7 hari lagi. Level 5 artinya 30 hari lagi.
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 90, 180];

const submitAnswer = async (req, res) => {
    try {
        const murid_id = req.user.id;
        const { vocab_id, waktu_jawab_detik, is_correct } = req.body;

        // 1 s.d 4 (Logika interval hari sama seperti sebelumnya)
        let kategori_terakhir = 'again';
        if (is_correct) {
            if (waktu_jawab_detik < 5) kategori_terakhir = 'easy';
            else if (waktu_jawab_detik <= 10) kategori_terakhir = 'medium';
            else if (waktu_jawab_detik <= 15) kategori_terakhir = 'hard';
            else kategori_terakhir = 'very_hard';
        }

        const check = await db.query('SELECT * FROM srs_reviews WHERE murid_id = $1 AND vocab_id = $2', [murid_id, vocab_id]);
        let current_level = check.rows.length > 0 ? check.rows[0].srs_level : 0;

        let new_level = current_level;
        const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 90, 180];
        
        if (kategori_terakhir === 'easy') new_level += 2;
        else if (kategori_terakhir === 'medium') new_level += 1;
        else if (kategori_terakhir === 'hard') new_level += 0;
        else if (kategori_terakhir === 'very_hard') new_level = Math.max(0, new_level - 1);
        else if (kategori_terakhir === 'again') new_level = 0;

        new_level = Math.min(new_level, SRS_INTERVALS.length - 1);
        let interval_hari = SRS_INTERVALS[new_level];
        if (kategori_terakhir === 'hard') interval_hari = 1;

        const next_review_date = new Date();
        next_review_date.setDate(next_review_date.getDate() + interval_hari);

        // 5. Simpan Jadwal Review
        if (check.rows.length > 0) {
            await db.query('UPDATE srs_reviews SET srs_level = $1, next_review_date = $2, kategori_terakhir = $3 WHERE murid_id = $4 AND vocab_id = $5', [new_level, next_review_date, kategori_terakhir, murid_id, vocab_id]);
        } else {
            await db.query('INSERT INTO srs_reviews (murid_id, vocab_id, srs_level, next_review_date, kategori_terakhir) VALUES ($1, $2, $3, $4, $5)', [murid_id, vocab_id, new_level, next_review_date, kategori_terakhir]);
        }

        // 6. [BARU] LOGIKA GAMIFIKASI (MEMBERIKAN EXP & KOIN)
        let exp_didapat = 0;
        let koin_didapat = 0;

        if (is_correct) {
            // Reward turun jika menjawabnya lambat
            if (kategori_terakhir === 'easy') { exp_didapat = 15; koin_didapat = 5; }
            else if (kategori_terakhir === 'medium') { exp_didapat = 10; koin_didapat = 3; }
            else if (kategori_terakhir === 'hard') { exp_didapat = 5; koin_didapat = 1; }
            else if (kategori_terakhir === 'very_hard') { exp_didapat = 2; koin_didapat = 0; }

            // PostgreSQL "ON CONFLICT": Jika dompet belum ada, buat baru. Jika sudah ada, tambahkan saldonya.
            await db.query(`
                INSERT INTO user_statistics (murid_id, total_exp_points, koin_dimiliki) 
                VALUES ($1, $2, $3)
                ON CONFLICT (murid_id) 
                DO UPDATE SET 
                    total_exp_points = user_statistics.total_exp_points + EXCLUDED.total_exp_points,
                    koin_dimiliki = user_statistics.koin_dimiliki + EXCLUDED.koin_dimiliki
            `, [murid_id, exp_didapat, koin_didapat]);
        }

        res.json({
            message: 'Jawaban SRS berhasil dikirim!',
            evaluasi_sistem: kategori_terakhir,
            level_sekarang: new_level,
            reward: {
                exp: exp_didapat,
                koin: koin_didapat
            }
        });

    } catch (error) {
        console.error('Error submitAnswer:', error.message);
        res.status(500).json({ message: 'Gagal memproses SRS.' });
    }
};

// Fungsi Mengambil Daftar Kosakata yang Harus Direview Hari Ini
const getTodayReviews = async (req, res) => {
    try {
        const murid_id = req.user.id; // Diambil dari token JWT

        // Menggabungkan tabel vocabularies dan srs_reviews
        // Syarat: Milik murid ini, dan tanggal reviewnya sudah lewat atau sama dengan detik ini
        const query = `
            SELECT v.id AS vocab_id, v.kanji, v.furigana, v.arti_indonesia, 
                   s.srs_level, s.next_review_date, s.kategori_terakhir
            FROM vocabularies v
            JOIN srs_reviews s ON v.id = s.vocab_id
            WHERE s.murid_id = $1 AND s.next_review_date <= NOW()
            ORDER BY s.next_review_date ASC
        `;

        const result = await db.query(query, [murid_id]);

        res.status(200).json({
            message: 'Berhasil memuat antrean SRS hari ini 🐿️',
            jumlah_antrean: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Error getTodayReviews:', error.message);
        res.status(500).json({ message: 'Gagal mengambil daftar review.' });
    }
};

// PENTING: Update baris ekspor menjadi seperti ini:
module.exports = { submitAnswer, getTodayReviews };