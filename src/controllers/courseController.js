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

module.exports = { getAllCourses, getCourseCurriculum };