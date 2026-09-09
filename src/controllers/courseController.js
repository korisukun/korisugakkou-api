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
        const muridId = req.user.id; 

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

        // [PERBAIKAN]: Mengecek Pendaftaran Kelas dari Hak Akses Produk, bukan dari jumlah Kosakata
        let isEnrolled = false;
        if (course.product_id) {
            const cekEnroll = await db.query(
                'SELECT id FROM user_access WHERE murid_id = $1 AND product_id = $2 LIMIT 1', 
                [muridId, course.product_id]
            );
            isEnrolled = cekEnroll.rows.length > 0;
        }

        res.json({ course: { ...course, modules: modulesData, is_enrolled: isEnrolled } });
    } catch (error) { res.status(500).json({ message: 'Gagal memuat kurikulum kelas.' }); }
};

const enrollCourse = async (req, res) => {
    const courseId = req.params.id;
    const muridId = req.user.id; 
    try {
        const cekSrs = await db.query('SELECT id FROM srs_reviews WHERE murid_id = $1 AND vocab_id IN (SELECT id FROM vocabularies WHERE course_id = $2) LIMIT 1', [muridId, courseId]);
        if (cekSrs.rows.length > 0) return res.status(400).json({ message: 'Kamu sudah mengikuti kelas ini! Kosakata sudah ada di kurikulummu.' });

        await db.query(`
            INSERT INTO srs_reviews (murid_id, vocab_id, arah_kuis, srs_level, next_review_date, kategori_terakhir)
            SELECT $1, v.id, d.arah, 0, CURRENT_TIMESTAMP, 'again'
            FROM vocabularies v
            CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(arah)
            WHERE v.course_id = $2
            ON CONFLICT (murid_id, vocab_id, arah_kuis) DO NOTHING
        `, [muridId, courseId]);

        const courseData = await db.query('SELECT product_id FROM courses WHERE id = $1', [courseId]);
        if(courseData.rows.length > 0 && courseData.rows[0].product_id) {
            await db.query(`INSERT INTO user_access (murid_id, product_id, tipe_akses) VALUES ($1, $2, 'lifetime')`, [muridId, courseData.rows[0].product_id]);
        }
        res.json({ message: 'Pendaftaran Berhasil! Seluruh kosakata kelas ini (6 Arah Kuis) telah dibuka. 🚀' });
    } catch (error) { res.status(500).json({ message: 'Gagal mendaftar kelas.' }); }
};

// FUNGSI BARU: Batal Ikuti Kelas
const unenrollCourse = async (req, res) => {
    const courseId = req.params.id;
    const muridId = req.user.id;
    try {
        // Hapus SEMUA jadwal SRS murid ini yang kosakatanya berasal dari kelas ini
        await db.query(`
            DELETE FROM srs_reviews 
            WHERE murid_id = $1 
            AND vocab_id IN (SELECT id FROM vocabularies WHERE course_id = $2)
        `, [muridId, courseId]);

        // Cek product_id untuk menghapus user_access (opsional, untuk kebersihan data)
        const courseData = await db.query('SELECT product_id FROM courses WHERE id = $1', [courseId]);
        if (courseData.rows.length > 0 && courseData.rows[0].product_id) {
            await db.query('DELETE FROM user_access WHERE murid_id = $1 AND product_id = $2', [muridId, courseData.rows[0].product_id]);
        }

        // Hapus progres tontonan materi agar bersih 100%
        await db.query(`
            DELETE FROM lesson_progress 
            WHERE murid_id = $1 
            AND lesson_id IN (
                SELECT l.id FROM lessons l 
                JOIN modules m ON l.module_id = m.id 
                WHERE m.course_id = $2
            )
        `, [muridId, courseId]);

        res.json({ message: 'Berhasil membatalkan pendaftaran. Seluruh kosakata kelas ini telah dihapus dari antrean kuis harianmu.' });
    } catch (error) {
        console.error('Error unenroll:', error.message);
        res.status(500).json({ message: 'Gagal membatalkan kelas.' });
    }
};

const addCourse = async (req, res) => {
    const { judul_course, thumbnail_url, deskripsi } = req.body;
    try {
        const newProduct = await db.query("INSERT INTO products (nama_produk, tipe_produk, harga_asli, is_active) VALUES ($1, 'course', 0, true) RETURNING id", [judul_course]);
        await db.query("INSERT INTO courses (product_id, judul_course, deskripsi, thumbnail_url) VALUES ($1, $2, $3, $4)", [newProduct.rows[0].id, judul_course, deskripsi, thumbnail_url]);
        res.status(201).json({ message: 'Kelas berhasil diterbitkan! 🎓' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const addModule = async (req, res) => {
    const { course_id, judul_modul, urutan_modul } = req.body;
    try {
        await db.query('INSERT INTO modules (course_id, judul_modul, urutan_modul) VALUES ($1, $2, $3)', [course_id, judul_modul, urutan_modul]);
        res.status(201).json({ message: 'Modul berhasil ditambahkan ke dalam kelas!' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const getModulesByCourse = async (req, res) => {
    try {
        const result = await db.query('SELECT id, judul_modul FROM modules WHERE course_id = $1 ORDER BY urutan_modul ASC', [req.params.id]);
        res.json({ modules: result.rows });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const addLesson = async (req, res) => {
    const { module_id, judul_materi, deskripsi, konten_url, tipe_lesson, urutan_lesson } = req.body;
    try {
        await db.query('INSERT INTO lessons (module_id, judul_materi, deskripsi, konten_url, tipe_lesson, urutan_lesson) VALUES ($1, $2, $3, $4, $5, $6)', [module_id, judul_materi, deskripsi, konten_url, tipe_lesson, urutan_lesson]);
        res.status(201).json({ message: 'Materi Video berhasil diunggah ke kurikulum!' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const getLessonsByModule = async (req, res) => {
    try {
        const result = await db.query('SELECT id, judul_materi FROM lessons WHERE module_id = $1 ORDER BY urutan_lesson ASC', [req.params.id]);
        res.json({ lessons: result.rows });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const editModule = async (req, res) => {
    const { id } = req.params;
    const { judul_modul, urutan_modul } = req.body;
    try {
        await db.query('UPDATE modules SET judul_modul = $1, urutan_modul = $2 WHERE id = $3', [judul_modul, urutan_modul, id]);
        res.json({ message: 'Modul berhasil diperbarui! ✅' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const editLesson = async (req, res) => {
    const { id } = req.params;
    const { judul_materi, deskripsi, konten_url, tipe_lesson, urutan_lesson } = req.body;
    try {
        await db.query('UPDATE lessons SET judul_materi = $1, deskripsi = $2, konten_url = $3, tipe_lesson = $4, urutan_lesson = $5 WHERE id = $6', [judul_materi, deskripsi, konten_url, tipe_lesson, urutan_lesson, id]);
        res.json({ message: 'Materi & Deskripsi berhasil diperbarui! ✅' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const editCourse = async (req, res) => {
    const { id } = req.params;
    const { judul_course, thumbnail_url, deskripsi } = req.body;
    try {
        await db.query('UPDATE courses SET judul_course = $1, thumbnail_url = $2, deskripsi = $3 WHERE id = $4', [judul_course, thumbnail_url, deskripsi, id]);
        res.json({ message: 'Informasi Kelas berhasil diperbarui! ✅' });
    } catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const deleteCourse = async (req, res) => {
    try { await db.query('DELETE FROM courses WHERE id = $1', [req.params.id]); res.json({ message: 'Kelas dan seluruh isinya berhasil dihapus! 🗑️' }); } 
    catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const deleteModule = async (req, res) => {
    try { await db.query('DELETE FROM modules WHERE id = $1', [req.params.id]); res.json({ message: 'Modul berhasil dihapus! 🗑️' }); } 
    catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

const deleteLesson = async (req, res) => {
    try { await db.query('DELETE FROM lessons WHERE id = $1', [req.params.id]); res.json({ message: 'Materi berhasil dihapus! 🗑️' }); } 
    catch (error) { res.status(500).json({ message: `Gagal: ${error.message}` }); }
};

module.exports = { getAllCourses, getCourseCurriculum, enrollCourse, unenrollCourse, addCourse, addModule, getModulesByCourse, addLesson, getLessonsByModule, editModule, editLesson, editCourse, deleteCourse, deleteModule, deleteLesson };