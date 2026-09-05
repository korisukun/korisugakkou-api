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

        const newUser = await db.query(
            'INSERT INTO users (nama_lengkap, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, nama_lengkap, email, role',
            [nama_lengkap, email, password_hash, role || 'murid']
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

// 2. FUNGSI LOGIN (DENGAN PELACAK BUG)
const login = async (req, res) => {
    try {
        console.log('--- PROSES LOGIN DIMULAI ---');
        const { email, password } = req.body;
        console.log(`1. Menerima permintaan login untuk email: ${email}`);

        console.log('2. Menghubungi Neon Database...');
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log(`3. Database merespons! Jumlah akun ditemukan: ${userResult.rows.length}`);

        if (userResult.rows.length === 0) {
            console.log('X. Berhenti: Email tidak terdaftar.');
            return res.status(400).json({ message: 'Email atau password salah!' });
        }
        
        const user = userResult.rows[0];

        console.log('4. Memeriksa kecocokan kata sandi dengan bcrypt...');
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`5. Hasil pencocokan sandi: ${isMatch}`);

        if (!isMatch) {
            console.log('X. Berhenti: Kata sandi salah.');
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        console.log('6. Membuat kunci tiket masuk (JWT)...');
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('7. Proses login SUKSES! Mengirim balasan ke frontend...');
        res.json({
            message: 'Login berhasil! Selamat datang kembali 🐿️',
            token: token,
            user: { id: user.id, nama_lengkap: user.nama_lengkap, role: user.role }
        });

    } catch (error) {
        console.error('ERROR KRITIS SAAT LOGIN:', error.message);
        console.error(error.stack); // Ini akan melacak letak baris error secara presisi
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { register, login };