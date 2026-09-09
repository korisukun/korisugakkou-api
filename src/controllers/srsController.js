const db = require('../config/db');

// 1. Mengambil Antrean Review & Bank Kosakata Utuh
const getTodayReviews = async (req, res) => {
    const muridId = req.user.id;
    const courseId = req.query.course_id; 

    try {
        if (courseId) {
            // Ambil maksimal 30 soal untuk dikirim ke memori Kuis
            const result = await db.query(`
                SELECT sr.vocab_id, sr.arah_kuis, sr.srs_level, sr.avg_waktu_detik, sr.total_review,
                       v.kanji, v.furigana, v.arti_indonesia
                FROM srs_reviews sr
                JOIN vocabularies v ON sr.vocab_id = v.id
                WHERE sr.murid_id = $1 
                  AND v.course_id = $2
                  AND sr.next_review_date <= CURRENT_TIMESTAMP
                ORDER BY sr.srs_level ASC, sr.next_review_date ASC
                LIMIT 30
            `, [muridId, courseId]);

            // Hitung TOTAL ASLI seluruh antrean untuk ditampilkan di Dasbor/Notif
            const countResult = await db.query(`
                SELECT count(sr.id) as total
                FROM srs_reviews sr
                JOIN vocabularies v ON sr.vocab_id = v.id
                WHERE sr.murid_id = $1 
                  AND v.course_id = $2
                  AND sr.next_review_date <= CURRENT_TIMESTAMP
            `, [muridId, courseId]);
            
            const trueTotal = parseInt(countResult.rows[0].total);

            const kamusRes = await db.query(
                'SELECT kanji, furigana, arti_indonesia FROM vocabularies WHERE course_id = $1',
                [courseId]
            );

            res.json({ 
                jumlah_antrean: trueTotal, 
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

// 2. Menerima Jawaban Murid & Mengkalkulasi Logika Baru
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
        let safeAvgWaktu = parseFloat(avg_waktu_detik) || 0;
        let safeWaktuJawab = parseInt(waktu_jawab_detik) || 0;

        let newTotalReview = safeTotalReview + 1;
        let newAvgWaktu = ((safeAvgWaktu * safeTotalReview) + safeWaktuJawab) / newTotalReview;

        // 👉 INTERVAL BARU (DALAM DETIK): 30s, 1m, 10m, 12h, 1d, 3d, 7d, 15d, 30d
        const intervalSeconds = [30, 60, 600, 43200, 86400, 259200, 604800, 1296000, 2592000]; 
        
        let statusCat = 'again';
        let expReward = 0;
        let koinReward = 0;

        if (is_correct) {
            if (safeWaktuJawab < 5) {
                safeSrsLevel += 3; 
                statusCat = 'easy'; expReward = 20; koinReward = 4;
            } else if (safeWaktuJawab <= 10) {
                safeSrsLevel += 2; 
                statusCat = 'medium'; expReward = 15; koinReward = 3;
            } else if (safeWaktuJawab <= 15) {
                safeSrsLevel += 1; 
                statusCat = 'hard'; expReward = 10; koinReward = 2;
            } else {
                safeSrsLevel += 0;
                statusCat = 'very_hard'; expReward = 5; koinReward = 1;
            }
            safeSrsLevel = Math.min(safeSrsLevel, 8); // Maksimal Level 8
        } else {
            safeSrsLevel = 0;
            statusCat = 'again'; expReward = 0; koinReward = 0;
        }

        let secondsToAdd = intervalSeconds[safeSrsLevel];

        // Simpan progres menggunakan perhitungan detik (seconds)
        await db.query(`
            UPDATE srs_reviews 
            SET srs_level = $1, 
                next_review_date = CURRENT_TIMESTAMP + ($2 || ' seconds')::interval,
                kategori_terakhir = $3,
                total_review = $4,
                avg_waktu_detik = $5
            WHERE murid_id = $6 AND vocab_id = $7 AND arah_kuis = $8
        `, [safeSrsLevel, secondsToAdd, statusCat, newTotalReview, newAvgWaktu, muridId, vocab_id, arah_kuis]);

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

        res.json({ message: 'Progres disimpan.', reward: { exp: expReward, koin: koinReward } });
    } catch (error) {
        console.error('Error submit SRS:', error.message);
        res.status(500).json({ message: 'Gagal menyimpan hasil review.' });
    }
};

module.exports = { getTodayReviews, submitReview };