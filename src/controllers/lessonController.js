const db = require('../config/db');

// 1. Mengambil satu materi spesifik berdasarkan ID
const getLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lessonRes = await db.query('SELECT * FROM lessons WHERE id = $1', [id]);
        
        if (lessonRes.rows.length === 0) {
            return res.status(404).json({ message: 'Materi tidak ditemukan.' });
        }
        
        res.json({ lesson: lessonRes.rows[0] });
    } catch (error) {
        console.error('Error memuat video:', error.message);
        res.status(500).json({ message: 'Gagal memuat materi.' });
    }
};

// 2. Mencatat bahwa murid sudah selesai menonton & Memberi EXP
const completeLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const murid_id = req.user.id;

        // Cek apakah progres sudah pernah dicatat di tabel lesson_progress
        const cekProgress = await db.query('SELECT id FROM lesson_progress WHERE murid_id = $1 AND lesson_id = $2', [murid_id, id]);
        
        if (cekProgress.rows.length === 0) {
            await db.query('INSERT INTO lesson_progress (murid_id, lesson_id, is_completed) VALUES ($1, $2, true)', [murid_id, id]);
        } else {
            await db.query('UPDATE lesson_progress SET is_completed = true WHERE murid_id = $1 AND lesson_id = $2', [murid_id, id]);
        }

        // Tentukan jumlah hadiah yang didapat
        const expDidapat = 10;
        const koinDidapat = 5;

        // Gamifikasi: Gunakan UPSERT pada user_statistics untuk mencegah error row kosong
        await db.query(`
            INSERT INTO user_statistics (murid_id, koin_dimiliki, total_exp_points) 
            VALUES ($1, $2, $3)
            ON CONFLICT (murid_id) 
            DO UPDATE SET 
                koin_dimiliki = COALESCE(user_statistics.koin_dimiliki, 0) + EXCLUDED.koin_dimiliki, 
                total_exp_points = COALESCE(user_statistics.total_exp_points, 0) + EXCLUDED.total_exp_points
        `, [murid_id, koinDidapat, expDidapat]);

        res.json({ 
            message: 'Materi diselesaikan! +10 EXP & +5 Koin 🐿️', 
            exp_didapat: expDidapat,
            koin_didapat: koinDidapat
        });
    } catch (error) {
        console.error('Error simpan progres:', error.message);
        res.status(500).json({ message: 'Gagal menyimpan progres belajar.' });
    }
};

module.exports = { getLesson, completeLesson };