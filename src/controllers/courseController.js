const db = require('../config/db');

// 1. Fungsi Menambah Kelas (CREATE)
const createCourse = async (req, res) => {
    try {
        const { judul_course, deskripsi, thumbnail_url } = req.body;
        
        // Mengambil ID Sensei dari token JWT yang sudah dicek oleh Satpam (Middleware)
        const sensei_id = req.user.id; 

        const newCourse = await db.query(
            'INSERT INTO courses (judul_course, deskripsi, sensei_id, thumbnail_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [judul_course, deskripsi, sensei_id, thumbnail_url]
        );

        res.status(201).json({
            message: 'Kelas baru berhasil ditambahkan! 🐿️',
            course: newCourse.rows[0]
        });
    } catch (error) {
        console.error('Error createCourse:', error.message);
        res.status(500).json({ message: 'Gagal membuat kelas.' });
    }
};

// 2. Fungsi Mengambil Semua Kelas (READ)
const getAllCourses = async (req, res) => {
    try {
        // Mengambil data kelas terbaru dari database
        const courses = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
        
        res.status(200).json({
            message: 'Berhasil mengambil daftar kelas',
            jumlah: courses.rows.length,
            data: courses.rows
        });
    } catch (error) {
        console.error('Error getAllCourses:', error.message);
        res.status(500).json({ message: 'Gagal mengambil data kelas.' });
    }
};

module.exports = { createCourse, getAllCourses };
// 3. Fungsi Mengambil Detail Kelas beserta Bab dan Videonya (READ DETAIL)
const getCourseDetail = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Tahap 1: Ambil data utama kelas
        const courseRes = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
        let course = courseRes.rows[0];

        // Tahap 2: Ambil semua Bab (modules) yang dimiliki kelas ini
        const modulesRes = await db.query(
            'SELECT * FROM modules WHERE course_id = $1 ORDER BY urutan_modul ASC', 
            [courseId]
        );
        const modules = modulesRes.rows;

        // Tahap 3: Ambil semua Materi (lessons) yang menempel pada Bab-bab di kelas ini
        const lessonsRes = await db.query(`
            SELECT lessons.* FROM lessons 
            JOIN modules ON lessons.module_id = modules.id 
            WHERE modules.course_id = $1 
            ORDER BY lessons.urutan_lesson ASC
        `, [courseId]);
        const lessons = lessonsRes.rows;

        // Tahap 4: Merakit Videonya agar masuk ke dalam Bab masing-masing
        const kurikulum = modules.map(modul => {
            return {
                id_modul: modul.id,
                judul_modul: modul.judul_modul,
                urutan: modul.urutan_modul,
                // Filter: Masukkan video yang module_id-nya sama dengan id modul ini
                materi: lessons.filter(lesson => lesson.module_id === modul.id)
            };
        });

        // Menempelkan rakitan kurikulum ke dalam data kelas
        course.kurikulum = kurikulum;

        res.status(200).json({
            message: 'Berhasil memuat kurikulum kelas',
            data: course
        });

    } catch (error) {
        console.error('Error getCourseDetail:', error.message);
        res.status(500).json({ message: 'Gagal mengambil detail kelas.' });
    }
};

// PENTING: Jangan lupa ekspor fungsi barunya!
module.exports = { createCourse, getAllCourses, getCourseDetail };