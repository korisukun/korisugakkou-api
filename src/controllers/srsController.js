const db = require('../config/db');

// 1. Mengambil Antrean Review & Bank Kosakata Utuh
const getTodayReviews = async (req, res) => {
    const muridId = req.user.id;
    const courseId = req.query.course_id; 

    try {
        if (courseId) {
            const result = await db.query(`
                SELECT sr.vocab_id, sr.arah_kuis, sr.srs_level, sr.avg_waktu_detik,
                       v.kanji, v.furigana, v.arti_indonesia
                FROM srs_reviews sr
                JOIN vocabularies v ON sr.vocab_id = v.id
                WHERE sr.murid_id = $1 
                  AND v.course_id = $2
                  AND sr.next_review_date <= CURRENT_TIMESTAMP
                ORDER BY sr.next_review_date ASC
                LIMIT 50
            `, [muridId, courseId]);

            const kamusRes = await db.query(
                'SELECT kanji, furigana, arti_indonesia FROM vocabularies WHERE course_id = $1',
                [courseId]
            );

            res.json({ 
                jumlah_antrean: result.rows.length, 
                data: result.rows,
                kamus_distraktor: kamusRes.rows 
            });
        } else {
            const result = await db.query(`
                SELECT count(sr.id) as total
                FROM srs_reviews sr
                WHERE sr.murid_id = $1 AND sr.next_review_date <= CURRENT_TIMESTAMP
            `, [muridId]);
            res.json({ jumlah_antrean: parseInt(result.rows[0].total) });
        }
    } catch (error) {
        console.error('Error muat SRS:', error.message);
        res.status(500).json({ message: 'Gagal memuat antrean kuis.' });
    }
};

// 2. Menerima Jawaban Murid & MENTRANSFER HADIAH KE DATABASE
const submitReview = async (req, res) => {
    const muridId = req.user.id;
    const { vocab_id, arah_kuis, is_correct, waktu_jawab_detik } = req.body;

    try {
        const currentSrs = await db.query(
            'SELECT srs_level, total_review, avg_waktu_detik FROM srs_reviews WHERE murid_id = $1 AND vocab_id = $2 AND arah_kuis = $3',
            [muridId, vocab_id, arah_kuis]
        );

        if (currentSrs.rows.length === 0) return res.status(404).json({ message: 'Data SRS tidak ditemukan.' });

        let { srs_level, total_review, avg_waktu_detik } = currentSrs.rows[0];
        
        let newTotalReview = total_review + 1;
        let newAvgWaktu = ((parseFloat(avg_waktu_detik) * total_review) + waktu_jawab_detik) / newTotalReview;

        let intervalMinutes = 0;
        let statusCat = 'again';
        let expReward = 0;
        let koinReward = 0;

        if (is_correct) {
            srs_level += 1;
            statusCat = 'good';
            expReward = 5 + srs_level; 
            koinReward = 2; 

            const intervals = [0, 10, 720, 1440, 4320, 10080, 21600, 43200]; 
            intervalMinutes = srs_level < intervals.length ? intervals[srs_level] : 43200; 
        } else {
            srs_level = Math.max(0, srs_level - 1);
            intervalMinutes = 1; 
            expReward = 1; 
            koinReward = 0;
        }

        // A. Menyimpan progres memori
        await db.query(`
            UPDATE srs_reviews 
            SET srs_level = $1, 
                next_review_date = CURRENT_TIMESTAMP + ($2 || ' minutes')::interval,
                kategori_terakhir = $3,
                total_review = $4,
                avg_waktu_detik = $5
            WHERE murid_id = $6 AND vocab_id = $7 AND arah_kuis = $8
        `, [srs_level, intervalMinutes, statusCat, newTotalReview, newAvgWaktu, muridId, vocab_id, arah_kuis]);

        // B. [PERBAIKAN KRUSIAL] Menambahkan Koin dan EXP secara nyata ke profil database murid!
        if (expReward > 0 || koinReward > 0) {
            await db.query(`
                UPDATE users 
                SET koin = COALESCE(koin, 0) + $1, 
                    exp = COALESCE(exp, 0) + $2 
                WHERE id = $3
            `, [koinReward, expReward, muridId]);
        }

        res.json({ message: 'Progres arah kuis disimpan.', reward: { exp: expReward, koin: koinReward } });
    } catch (error) {
        console.error('Error submit SRS:', error.message);
        res.status(500).json({ message: 'Gagal menyimpan hasil review.' });
    }
};

module.exports = { getTodayReviews, submitReview };