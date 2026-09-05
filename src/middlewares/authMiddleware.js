const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware utama untuk mengecek login
const protect = (req, res, next) => {
    // Menangkap tiket dari frontend (format standarnya: "Bearer <token_jwt>")
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak! Anda harus login terlebih dahulu.' });
    }

    // Memisahkan kata 'Bearer' dan mengambil murni tokennya saja
    const token = authHeader.split(' ')[1];

    try {
        // Mengecek apakah token ini asli dan diciptakan oleh server kita
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Jika asli, kita tempelkan data murid (id & role) ke request agar bisa dibaca nanti
        req.user = decoded;
        
        next(); // Persilakan masuk (lanjut ke tujuan utama)
    } catch (error) {
        res.status(403).json({ message: 'Token palsu atau sudah kedaluwarsa! Silakan login ulang.' });
    }
};

// Middleware tambahan khusus untuk halaman Admin/Sensei
const isSensei = (req, res, next) => {
    if (req.user.role !== 'sensei' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak! Hanya Sensei yang boleh masuk.' });
    }
    next();
};

module.exports = { protect, isSensei };