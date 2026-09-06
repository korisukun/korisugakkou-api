const db = require('../config/db');

const getCourses = async (req, res) => {
    try {
        // 1. Ambil data Course
        const courseRes = await db.query('SELECT * FROM courses ORDER BY id ASC LIMIT 1');
        if (courseRes.rows.length === 0) {
            return res.status(200).json({ courses: [] });
        }
        
        const course = courseRes.rows[0];

        // 2. Ambil Modul untuk Course tersebut
        const modRes = await db.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY urutan_modul ASC', [course.id]);
        
        // 3. Ambil seluruh Lesson
        const lesRes = await db.query('SELECT * FROM lessons ORDER BY urutan_lesson ASC');

        // 4. Susun hierarkinya (Module -> berisi Lessons)
        const modulesData = modRes.rows.map(mod => {
            return {
                id: mod.id,
                judul_modul: mod.judul_modul,
                lessons: lesRes.rows.filter(l => l.module_id === mod.id)
            };
        });

        // 5. Gabungkan ke dalam Course
        const kurikulumLengkap = {
            id: course.id,
            judul_course: course.judul_course,
            deskripsi: course.deskripsi,
            modules: modulesData
        };

        res.status(200).json({ 
            message: 'Berhasil memuat kurikulum 🐿️', 
            course: kurikulumLengkap 
        });

    } catch (error) {
        console.error('Error muat materi:', error.message);
        res.status(500).json({ message: 'Gagal memuat kurikulum kelas.' });
    }
};

module.exports = { getCourses };