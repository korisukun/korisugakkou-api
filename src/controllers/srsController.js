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
        
        let safeSrsLevel = parseInt(srs_level) || 0;
        let safeTotalReview = parseInt(total_review) || 0;
        let safeAvgWaktu = parseInt(avg_waktu_detik) || 0;
        let safeWaktuJawab = parseInt(waktu_jawab_detik) || 0;

        let newTotalReview = safeTotalReview + 1;
        let newAvgWaktu = Math.round(((safeAvgWaktu * safeTotalReview) + safeWaktuJawab) / newTotalReview);

        // Interval berdasarkan Kategori (0 = 1m, 1 = 10m, 2 = 12j, 3 = 1h, 4 = 3h, 5 = 7h, 6 = 15h, 7 = 30h)
        const intervals = [1, 10, 720, 1440, 4320, 10080, 21600, 43200]; 
        let intervalMinutes = 1;
        let statusCat = 'again';
        let expReward = 0;
        let koinReward = 0;

        if (is_correct) {
            if (safeWaktuJawab < 5) {
                safeSrsLevel += 2; 
                statusCat = 'easy';
                expReward = 15 + safeSrsLevel;
                koinReward = 5;
            } else if (safeWaktuJawab <= 10) {
                safeSrsLevel += 1; 
                statusCat = 'medium';
                expReward = 10 + safeSrsLevel;
                koinReward = 3;
            } else if (safeWaktuJawab <= 15) {
                safeSrsLevel += 0; 
                statusCat = 'hard';
                expReward = 5 + safeSrsLevel;
                koinReward = 2;
            } else {
                safeSrsLevel = Math.max(0, safeSrsLevel - 1);
                statusCat = 'very_hard';
                expReward = 2 + safeSrsLevel;
                koinReward = 1;
            }

            safeSrsLevel = Math.min(safeSrsLevel, intervals.length - 1);
            intervalMinutes = intervals[safeSrsLevel];

        } else {
            safeSrsLevel = 0;
            statusCat = 'again';
            intervalMinutes = intervals[0];
            expReward = 1; 
            koinReward = 0;
        }

        // Simpan progres waktu review SRS
        await db.query(`
            UPDATE srs_reviews 
            SET srs_level = $1, 
                next_review_date = CURRENT_TIMESTAMP + ($2 || ' minutes')::interval,
                kategori_terakhir = $3,
                total_review = $4,
                avg_waktu_detik = $5
            WHERE murid_id = $6 AND vocab_id = $7 AND arah_kuis = $8
        `, [safeSrsLevel, intervalMinutes, statusCat, newTotalReview, newAvgWaktu, muridId, vocab_id, arah_kuis]);

        // UPSERT Statistik (Exp & Koin)
        if (expReward > 0 || koinReward > 0) {
            await db.query(`
                INSERT INTO user_statistics (murid_id, koin_dimiliki, total_exp_points) 
                VALUES ($1, $2, $3)
                ON CONFLICT (murid_id) 
                DO UPDATE SET 
                    koin_dimiliki = COALESCE(user_statistics.koin_dimiliki, 0) + EXCLUDED.koin_dimiliki, 
                    total_exp_points = COALESCE(user_statistics.total_exp_points, 0) + EXCLUDED.total_exp_points
            `, [muridId, koinReward, expReward]);
        }

        res.json({ message: 'Progres arah kuis disimpan.', reward: { exp: expReward, koin: koinReward } });
    } catch (error) {
        console.error('Error submit SRS:', error.message);
        res.status(500).json({ message: 'Gagal menyimpan hasil review.' });
    }
};

module.exports = { getTodayReviews, submitReview };