const db = require('./db');

const createTables = async () => {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            nama_lengkap VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) CHECK (role IN ('murid', 'sensei', 'admin')) DEFAULT 'murid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP
        );
    `;

    // INI TAMBAHAN BARUNYA:
    const lmsTables = `
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            judul_course VARCHAR(255) NOT NULL,
            deskripsi TEXT,
            sensei_id INTEGER REFERENCES users(id),
            thumbnail_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS modules (
            id SERIAL PRIMARY KEY,
            course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
            judul_modul VARCHAR(255) NOT NULL,
            urutan_modul INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lessons (
            id SERIAL PRIMARY KEY,
            module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
            judul_materi VARCHAR(255) NOT NULL,
            tipe_lesson VARCHAR(50) DEFAULT 'video_youtube',
            konten_url VARCHAR(255),
            urutan_lesson INTEGER NOT NULL
        );
    `;
    // INI TAMBAHAN UNTUK SRS:
    const srsTables = `
        CREATE TABLE IF NOT EXISTS vocabulary_categories (
            id SERIAL PRIMARY KEY,
            nama_kategori VARCHAR(255) NOT NULL,
            deskripsi TEXT
        );

        CREATE TABLE IF NOT EXISTS vocabularies (
            id SERIAL PRIMARY KEY,
            kanji VARCHAR(255) NOT NULL,
            furigana VARCHAR(255),
            arti_indonesia VARCHAR(255) NOT NULL,
            audio_url VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS vocab_category_mapping (
            id SERIAL PRIMARY KEY,
            vocab_id INTEGER REFERENCES vocabularies(id) ON DELETE CASCADE,
            category_id INTEGER REFERENCES vocabulary_categories(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS srs_reviews (
            id SERIAL PRIMARY KEY,
            murid_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            vocab_id INTEGER REFERENCES vocabularies(id) ON DELETE CASCADE,
            srs_level INTEGER DEFAULT 0,
            next_review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            kategori_terakhir VARCHAR(50) DEFAULT 'again'
        );
    `;
    // INI TAMBAHAN UNTUK GAMIFIKASI:
    const gamificationTables = `
        CREATE TABLE IF NOT EXISTS user_statistics (
            id SERIAL PRIMARY KEY,
            murid_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            total_exp_points INTEGER DEFAULT 0,
            koin_dimiliki INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0
        );
    `;
    // INI TAMBAHAN UNTUK TOKO VIRTUAL & MASKOT:
    const shopTables = `
        CREATE TABLE IF NOT EXISTS shop_items (
            id SERIAL PRIMARY KEY,
            nama_item VARCHAR(255) NOT NULL,
            tipe_item VARCHAR(50) CHECK (tipe_item IN ('aksesoris', 'makanan', 'background')),
            harga_koin INTEGER NOT NULL,
            image_url VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS user_mascots (
            id SERIAL PRIMARY KEY,
            murid_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            level_mascot INTEGER DEFAULT 1,
            status_mood VARCHAR(50) DEFAULT 'senang'
        );

        CREATE TABLE IF NOT EXISTS user_inventory (
            id SERIAL PRIMARY KEY,
            murid_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    // INI TAMBAHAN UNTUK QUOTES MOTIVASI:
    const quotesTables = `
        CREATE TABLE IF NOT EXISTS study_quotes (
            id SERIAL PRIMARY KEY,
            teks_jepang TEXT NOT NULL,
            cara_baca TEXT,
            arti_indonesia TEXT NOT NULL,
            sumber_tokoh VARCHAR(100),
            kategori_fokus VARCHAR(50) DEFAULT 'general'
        );

        CREATE TABLE IF NOT EXISTS user_favorite_quotes (
            id SERIAL PRIMARY KEY,
            murid_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            quote_id INTEGER REFERENCES study_quotes(id) ON DELETE CASCADE
        );
    `;

    try {
        console.log('Sedang memproses database...');
        await db.query(usersTable);
        await db.query(lmsTables); // Mengeksekusi pembuatan tabel LMS
	await db.query(srsTables); // Eksekusi tabel SRS
	await db.query(gamificationTables); // Eksekusi tabel Gamifikasi
	await db.query(shopTables); // Eksekusi tabel Toko
	await db.query(quotesTables); // Eksekusi tabel Quotes
        console.log('Tabel Toko Virtual & Maskot berhasil disiapkan! 🐿️');
        console.log('Tabel Statistik & Gamifikasi berhasil disiapkan! 🐿️');
        console.log('Tabel SRS dan Bank Kosakata berhasil disiapkan! 🐿️');
        console.log('Tabel Users dan LMS berhasil disiapkan! 🐿️');
    } catch (err) {
        console.error('Terjadi kesalahan:', err.message);
    } finally {
        process.exit();
    }
};

createTables();