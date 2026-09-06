const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Menerima payload JSON dari frontend

// Pengaturan Satpam CORS
app.use(cors({
    origin: [
        'https://korisugakkou.com', 
        'https://www.korisugakkou.com',
        'http://localhost:5000' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Tes pancingan agar database merespons
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Koneksi Database Gagal:', err.message);
    } else {
        console.log('PostgreSQL (Neon) Berhasil Terhubung! Waktu Server:', res.rows[0].now);
    }
});

// ==========================================
// ROUTING API
// ==========================================
const authRoutes = require('./src/routes/authRoutes');
app.use('/api', authRoutes); 

const courseRoutes = require('./src/routes/courseRoutes');
app.use('/api/courses', courseRoutes);

// KOREKSI: Diubah dari /api/curriculum menjadi /api/lessons agar cocok dengan frontend video-player.html
const lessonRoutes = require('./src/routes/lessonRoutes');
app.use('/api/lessons', lessonRoutes);

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

// ==========================================
// MIDDLEWARE & PROTECTED ROUTES
// ==========================================
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