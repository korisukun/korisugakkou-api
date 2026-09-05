const { Pool } = require('pg');
require('dotenv').config();

// Menggunakan DATABASE_URL dari Neon dengan mode SSL wajib
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Wajib ditambahkan untuk layanan Cloud Database seperti Neon/Render
    }
});

pool.connect()
    .then(() => console.log('✅ Berhasil terhubung ke Cloud Database KORISU Gakkou di Neon.tech! 🐿️'))
    .catch(err => console.error('❌ Gagal terhubung ke Cloud Database', err));

module.exports = pool;