const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db'); // Baris pemanggil database
// Tes pancingan agar database merespons
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Koneksi Gagal:', err.message);
    } else {
        console.log('PostgreSQL merespons pada:', res.rows[0].now);
    }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Pengaturan Satpam CORS (Daftar Tamu VIP)
app.use(cors({
    origin: [
        'https://korisugakkou.com', 
        'https://www.korisugakkou.com',
        'http://localhost:5000' // Tetap kita izinkan untuk tes di komputer lokal
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json()); // Menerima payload JSON dari frontend
// Memanggil file routes
const authRoutes = require('./src/routes/authRoutes');

// Mendaftarkan URL awal untuk sistem autentikasi
app.use('/api/auth', authRoutes);
const courseRoutes = require('./src/routes/courseRoutes');
app.use('/api/courses', courseRoutes);
const lessonRoutes = require('./src/routes/lessonRoutes');
app.use('/api/curriculum', lessonRoutes);
const vocabRoutes = require('./src/routes/vocabRoutes');
app.use('/api/vocabulary', vocabRoutes);
const srsRoutes = require('./src/routes/srsRoutes');
app.use('/api/srs', srsRoutes);
const shopRoutes = require('./src/routes/shopRoutes');
app.use('/api/shop', shopRoutes);
const quoteRoutes = require('./src/routes/quoteRoutes');
app.use('/api/quotes', quoteRoutes);

// Endpoint Tes (Health Check)
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "sukses",
        message: "Server KORISU Gakkou berjalan dengan baik! 🐿️" 
    });
});

// Menyalakan Server
const { protect, isSensei } = require('./src/middlewares/authMiddleware');

// Halaman LMS Utama (Hanya bisa dibuka jika login valid)
app.get('/api/lms/materi-eksklusif', protect, (req, res) => {
    res.json({
        message: "Berhasil masuk! Ini adalah materi rahasia Kaigo Kokka Shiken.",
        profil_pengakses: req.user
    });
});
app.listen(PORT, () => {
    console.log(`Server siap dan berjalan di port ${PORT}`);
});