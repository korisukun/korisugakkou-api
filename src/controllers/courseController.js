const db = require('../config/db');

const getAllCourses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses ORDER BY id ASC');
        res.json({ courses: result.rows });
    } catch (error) { res.status(500).json({ message: 'Gagal memuat katalog kelas.' }); }
};

const getCourseCurriculum = async (req, res) => {
    try {
        const { id } = req.params;
        const courseRes = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
        
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        
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
    } catch (error) { res.status(500).json({ message: 'Gagal memuat kurikulum kelas.' }); }
};

const enrollCourse = async (req, res) => {
    const courseId = req.params.id;
    const muridId = req.user.id; 

    try {
        const cekSrs = await db.query(
            'SELECT id FROM srs_reviews WHERE murid_id = $1 AND vocab_id IN (SELECT id FROM vocabularies WHERE course_id = $2) LIMIT 1', 
            [muridId, courseId]
        );

        if (cekSrs.rows.length > 0) return res.status(400).json({ message: 'Kamu sudah mengikuti kelas ini!' });

        await db.query(`
            INSERT INTO srs_reviews (murid_id, vocab_id, srs_level, next_review_date, kategori_terakhir)
            SELECT $1, id, 0, CURRENT_TIMESTAMP, 'again' FROM vocabularies WHERE course_id = $2 ON CONFLICT (murid_id, vocab_id) DO NOTHING
        `, [muridId, courseId]);

        const courseData = await db.query('SELECT product_id FROM courses WHERE id = $1', [courseId]);
        if(courseData.rows.length > 0) {
            await db.query(`INSERT INTO user_access (murid_id, product_id, tipe_akses) VALUES ($1, $2, 'lifetime')`, [muridId, courseData.rows[0].product_id]);
        }

        res.json({ message: 'Pendaftaran Berhasil! Kosakata kelas ini telah ditambahkan ke Kuis SRS harianmu. 🚀' });
    } catch (error) { res.status(500).json({ message: 'Gagal mendaftar kelas.' }); }
};

const addCourse = async (req, res) => {
    const { judul_course, thumbnail_url, deskripsi } = req.body;
    try {
        const newProduct = await db.query(
            "INSERT INTO products (nama_produk, tipe_produk, harga_asli, is_active) VALUES ($1, 'course', 0, true) RETURNING id",
            [judul_course]
        );
        await db.query(
            "INSERT INTO courses (product_id, judul_course, deskripsi, thumbnail_url) VALUES ($1, $2, $3, $4)",
            [newProduct.rows[0].id, judul_course, deskripsi, thumbnail_url]
        );
        res.status(201).json({ message: 'Kelas berhasil diterbitkan! 🎓' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

// 5. [BARU] Menambah Modul Baru
const addModule = async (req, res) => {
    const { course_id, judul_modul, urutan_modul } = req.body;
    try {
        await db.query(
            'INSERT INTO modules (course_id, judul_modul, urutan_modul) VALUES ($1, $2, $3)',
            [course_id, judul_modul, urutan_modul]
        );
        res.status(201).json({ message: 'Modul berhasil ditambahkan ke dalam kelas!' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

// 6. [BARU] Mengambil Daftar Modul Berdasarkan Kelas (Untuk Dropdown Dinamis)
const getModulesByCourse = async (req, res) => {
    try {
        const result = await db.query('SELECT id, judul_modul FROM modules WHERE course_id = $1 ORDER BY urutan_modul ASC', [req.params.id]);
        res.json({ modules: result.rows });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

// 7. [BARU] Menambah Materi (Lesson) Baru
const addLesson = async (req, res) => {
    const { module_id, judul_materi, konten_url, tipe_lesson, urutan_lesson } = req.body;
    try {
        await db.query(
            'INSERT INTO lessons (module_id, judul_materi, konten_url, tipe_lesson, urutan_lesson) VALUES ($1, $2, $3, $4, $5)',
            [module_id, judul_materi, konten_url, tipe_lesson, urutan_lesson]
        );
        res.status(201).json({ message: 'Materi Video berhasil diunggah ke kurikulum!' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

module.exports = { getAllCourses, getCourseCurriculum, enrollCourse, addCourse, addModule, getModulesByCourse, addLesson };