const db = require('../config/db');

// 1. Mengambil Semua Daftar Kelas (Katalog)
const getAllCourses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses ORDER BY id ASC');
        res.json({ courses: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat katalog kelas.' });
    }
};

// 2. Mengambil Kurikulum dari 1 Kelas Spesifik
const getCourseCurriculum = async (req, res) => {
    try {
        const { id } = req.params;
        const courseRes = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
        
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        }
        
        const course = courseRes.rows[0];
        const modRes = await db.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY urutan_modul ASC', [id]);
        const lesRes = await db.query('SELECT * FROM lessons ORDER BY urutan_lesson ASC');

        const modulesData = modRes.rows.map(mod => {
            return {
                id: mod.id,
                judul_modul: mod.judul_modul,
                lessons: lesRes.rows.filter(l => l.module_id === mod.id)
            };
        });

        res.json({ course: { ...course, modules: modulesData } });
    } catch (error) {
        console.error('Error muat kurikulum:', error.message);
        res.status(500).json({ message: 'Gagal memuat kurikulum kelas.' });
    }
};

// 3. Murid Mendaftar Kelas (Menyalin Kosakata ke Meja Belajar)
const enrollCourse = async (req, res) => {
    const courseId = req.params.id;
    const muridId = req.user.id; 

    try {
        const cekSrs = await db.query(
            'SELECT id FROM srs_reviews WHERE murid_id = $1 AND vocab_id IN (SELECT id FROM vocabularies WHERE course_id = $2) LIMIT 1', 
            [muridId, courseId]
        );

        if (cekSrs.rows.length > 0) {
            return res.status(400).json({ message: 'Kamu sudah mengikuti kelas ini! Kosakata sudah ada di misi harianmu.' });
        }

        const insertSrs = await db.query(`
            INSERT INTO srs_reviews (murid_id, vocab_id, srs_level, next_review_date, kategori_terakhir)
            SELECT $1, id, 0, CURRENT_TIMESTAMP, 'again'
            FROM vocabularies
            WHERE course_id = $2
            ON CONFLICT (murid_id, vocab_id) DO NOTHING
        `, [muridId, courseId]);

        const courseData = await db.query('SELECT product_id FROM courses WHERE id = $1', [courseId]);
        if(courseData.rows.length > 0) {
            await db.query(`
                INSERT INTO user_access (murid_id, product_id, tipe_akses)
                VALUES ($1, $2, 'lifetime')
            `, [muridId, courseData.rows[0].product_id]);
        }

        res.json({ message: 'Pendaftaran Berhasil! Kosakata kelas ini telah ditambahkan ke Kuis SRS harianmu. 🚀' });
    } catch (error) {
        console.error('Error enroll:', error.message);
        res.status(500).json({ message: 'Gagal mendaftar kelas.' });
    }
};

// INI ADALAH BARIS YANG MEMBUAT ERROR SEBELUMNYA JIKA TERLEWAT
module.exports = { getAllCourses, getCourseCurriculum, enrollCourse };