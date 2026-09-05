const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// --- JARING PENGAMAN ANTI-CRASH ---
pool.on('error', (err, client) => {
    console.error('Peringatan: Koneksi database terputus secara tidak terduga', err.message);
    // Dengan adanya fungsi ini, server TIDAK AKAN mati saat koneksi berkedip.
});

module.exports = pool;