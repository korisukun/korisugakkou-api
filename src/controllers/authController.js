const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. FUNGSI REGISTRASI
const register = async (req, res) => {
    try {
        const { nama_lengkap, email, password, role } = req.body;

        const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: 'Email tersebut sudah terdaftar!' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // A. Simpan data profil utama
        const newUser = await db.query(
            'INSERT INTO users (nama_lengkap, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, nama_lengkap, email, role',
            [nama_lengkap, email, password_hash, role || 'murid']
        );

        const newUserId = newUser.rows[0].id;

        // B. [PENTING ERD V.1.0] Buat dompet statistik kosong untuk murid ini
        await db.query(
            'INSERT INTO user_statistics (murid_id, total_exp_points, koin_dimiliki, current_streak) VALUES ($1, 0, 0, 0)',
            [newUserId]
        );

        res.status(201).json({
            message: 'Registrasi berhasil! Selamat datang di KORISU Gakkou 🐿️',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Error saat registrasi:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// 2. FUNGSI LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }
        
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        // C. [PENTING ERD V.1.0] Ambil dompet statistik murid dari tabel terpisah
        const statsResult = await db.query('SELECT koin_dimiliki, total_exp_points, current_streak FROM user_statistics WHERE murid_id = $1', [user.id]);
        
        // Beri nilai bawaan 0 jika dompet karena alasan tertentu belum terbuat
        const userStats = statsResult.rows.length > 0 ? statsResult.rows[0] : { koin_dimiliki: 0, total_exp_points: 0, current_streak: 0 };

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil! Selamat datang kembali 🐿️',
            token: token,
            user: { 
                id: user.id, 
                nama_lengkap: user.nama_lengkap, 
                role: user.role,
                koin: userStats.koin_dimiliki, // Diambil dari user_statistics
                exp: userStats.total_exp_points, // Diambil dari user_statistics
                streak: userStats.current_streak // Diambil dari user_statistics
            }
        });

    } catch (error) {
        console.error('ERROR KRITIS SAAT LOGIN:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { register, login };