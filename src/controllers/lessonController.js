const db = require('../config/db');

// 1. Fungsi Membuat Bab (Modul)
const createModule = async (req, res) => {
    try {
        const { course_id, judul_modul, urutan_modul } = req.body;
        
        const newModule = await db.query(
            'INSERT INTO modules (course_id, judul_modul, urutan_modul) VALUES ($1, $2, $3) RETURNING *',
            [course_id, judul_modul, urutan_modul]
        );

        res.status(201).json({
            message: 'Modul/Bab berhasil dibuat!',
            module: newModule.rows[0]
        });
    } catch (error) {
        console.error('Error createModule:', error.message);
        res.status(500).json({ message: 'Gagal membuat modul.' });
    }
};

// 2. Fungsi Memasukkan Video/Materi (Lesson)
const createLesson = async (req, res) => {
    try {
        const { module_id, judul_materi, tipe_lesson, konten_url, urutan_lesson } = req.body;
        
        const newLesson = await db.query(
            'INSERT INTO lessons (module_id, judul_materi, tipe_lesson, konten_url, urutan_lesson) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [module_id, judul_materi, tipe_lesson, konten_url, urutan_lesson]
        );

        res.status(201).json({
            message: 'Video materi berhasil ditambahkan ke dalam Bab! 🎬',
            lesson: newLesson.rows[0]
        });
    } catch (error) {
        console.error('Error createLesson:', error.message);
        res.status(500).json({ message: 'Gagal membuat materi.' });
    }
};

module.exports = { createModule, createLesson };