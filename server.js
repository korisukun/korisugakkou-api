const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

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
    if (err) console.error('Koneksi Database Gagal:', err.message);
    else console.log('PostgreSQL (Neon) Berhasil Terhubung! Waktu Server:', res.rows[0].now);
});

// ==========================================
// ROUTING API UTAMA
// ==========================================
app.use('/api', require('./src/routes/authRoutes')); 
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/lessons', require('./src/routes/lessonRoutes'));
app.use('/api/vocabulary', require('./src/routes/vocabRoutes'));
app.use('/api/srs', require('./src/routes/srsRoutes'));
app.use('/api/shop', require('./src/routes/shopRoutes'));
app.use('/api/quotes', require('./src/routes/quoteRoutes'));
app.use('/api/community', require('./src/routes/communityRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// Endpoint Tes (Health Check)
app.get('/api/status', (req, res) => {
    res.json({ status: "sukses", message: "Server KORISU Gakkou berjalan dengan baik! 🐿️" });
});

// ==========================================
// MIDDLEWARE & PROTECTED ROUTES KHUSUS
// ==========================================
const { protect } = require('./src/middlewares/authMiddleware');
const { getMascot } = require('./src/controllers/shopController');

app.get('/api/lms/materi-eksklusif', protect, (req, res) => {
    res.json({ message: "Berhasil masuk! Ini materi rahasia Kaigo.", profil_pengakses: req.user });
});

app.get('/api/mascot', protect, getMascot);

app.listen(PORT, () => { console.log(`Server siap dan berjalan di port ${PORT}`); });