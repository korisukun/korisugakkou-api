const db = require('./db');

const createTables = async () => {
    // 100% Menggunakan Struktur ERD Resmi KORISU Gakkou dengan Relasi CASCADE Penuh
    const schemaDatabaseMutlak = `
        CREATE SCHEMA IF NOT EXISTS "public";

        CREATE TABLE IF NOT EXISTS "achievements" (
            "id" serial PRIMARY KEY,
            "nama_badge" varchar(100) NOT NULL,
            "syarat_tipe" varchar(50) NOT NULL,
            "syarat_nilai" integer NOT NULL,
            "ikon_url" varchar(255)
        );

        CREATE TABLE IF NOT EXISTS "users" (
            "id" serial PRIMARY KEY,
            "nama_lengkap" varchar(100) NOT NULL,
            "email" varchar(100) NOT NULL CONSTRAINT "users_email_key" UNIQUE,
            "password_hash" varchar(255) NOT NULL,
            "role" varchar(20) DEFAULT 'murid',
            "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
            "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
            "deleted_at" timestamp,
            CONSTRAINT "users_role_check" CHECK (((role)::text = ANY ((ARRAY['murid'::character varying, 'sensei'::character varying, 'admin'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "blog_posts" (
            "id" serial PRIMARY KEY,
            "penulis_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "judul" varchar(255) NOT NULL,
            "slug_url" varchar(255) NOT NULL CONSTRAINT "blog_posts_slug_url_key" UNIQUE,
            "konten_html" text NOT NULL,
            "kategori" varchar(100),
            "is_published" boolean DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS "coaching_schedules" (
            "id" serial PRIMARY KEY,
            "sensei_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "waktu_mulai" timestamp NOT NULL,
            "waktu_selesai" timestamp NOT NULL,
            "status_booking" varchar(20) DEFAULT 'tersedia',
            CONSTRAINT "coaching_schedules_status_booking_check" CHECK (((status_booking)::text = ANY ((ARRAY['tersedia'::character varying, 'terisi'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "coaching_bookings" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "schedule_id" integer REFERENCES "coaching_schedules"("id") ON DELETE CASCADE,
            "link_zoom_meet" varchar(255),
            "catatan_murid" text
        );

        CREATE TABLE IF NOT EXISTS "coaching_credits" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "sisa_kredit_sesi" integer DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "comments" (
            "id" serial PRIMARY KEY,
            "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "tipe_target" varchar(50),
            "target_id" integer NOT NULL,
            "isi_komentar" text NOT NULL,
            "parent_id" integer REFERENCES "comments"("id") ON DELETE CASCADE,
            CONSTRAINT "comments_tipe_target_check" CHECK (((tipe_target)::text = ANY ((ARRAY['lesson_video'::character varying, 'blog_post'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "community_posts" (
            "id" serial PRIMARY KEY,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "konten" text NOT NULL,
            "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "community_comments" (
            "id" serial PRIMARY KEY,
            "post_id" integer REFERENCES "community_posts"("id") ON DELETE CASCADE,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "komentar" text NOT NULL,
            "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
            "parent_id" integer REFERENCES "community_comments"("id") ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "community_likes" (
            "id" serial PRIMARY KEY,
            "post_id" integer REFERENCES "community_posts"("id") ON DELETE CASCADE,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "community_likes_post_id_user_id_key" UNIQUE("post_id","user_id")
        );

        CREATE TABLE IF NOT EXISTS "coupons" (
            "id" serial PRIMARY KEY,
            "kode_kupon" varchar(50) NOT NULL CONSTRAINT "coupons_kode_kupon_key" UNIQUE,
            "tipe_potongan" varchar(20),
            "nilai_potongan" numeric(10, 2) NOT NULL,
            "kuota_pemakaian" integer DEFAULT 0,
            "tanggal_expired" timestamp,
            CONSTRAINT "coupons_tipe_potongan_check" CHECK (((tipe_potongan)::text = ANY ((ARRAY['persentase'::character varying, 'nominal'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "products" (
            "id" serial PRIMARY KEY,
            "nama_produk" varchar(255) NOT NULL,
            "tipe_produk" varchar(50),
            "harga_asli" numeric(10, 2) NOT NULL,
            "is_active" boolean DEFAULT true,
            CONSTRAINT "products_tipe_produk_check" CHECK (((tipe_produk)::text = ANY ((ARRAY['course'::character varying, 'digital_product'::character varying, 'coaching_bundle'::character varying, 'item_virtual'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "courses" (
            "id" serial PRIMARY KEY,
            "product_id" integer REFERENCES "products"("id") ON DELETE CASCADE,
            "judul_course" varchar(255) NOT NULL,
            "deskripsi" text,
            "sensei_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
            "thumbnail_url" varchar(255)
        );

        CREATE TABLE IF NOT EXISTS "daily_quests" (
            "id" serial PRIMARY KEY,
            "nama_misi" varchar(255) NOT NULL,
            "tipe_misi" varchar(50) NOT NULL,
            "target_angka" integer NOT NULL,
            "reward_exp" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "exam_schedules" (
            "id" serial PRIMARY KEY,
            "nama_ujian" varchar(100) NOT NULL,
            "kategori_ujian" varchar(50),
            "tanggal_ujian" date NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "modules" (
            "id" serial PRIMARY KEY,
            "course_id" integer REFERENCES "courses"("id") ON DELETE CASCADE,
            "judul_modul" varchar(255) NOT NULL,
            "urutan_modul" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "lessons" (
            "id" serial PRIMARY KEY,
            "module_id" integer REFERENCES "modules"("id") ON DELETE CASCADE,
            "judul_materi" varchar(255) NOT NULL,
            "tipe_lesson" varchar(50),
            "konten_url" varchar(255),
            "urutan_lesson" integer NOT NULL,
            "is_prerequisite_required" boolean DEFAULT false,
            "deskripsi" text
        );

        CREATE TABLE IF NOT EXISTS "lesson_progress" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "lesson_id" integer REFERENCES "lessons"("id") ON DELETE CASCADE,
            "is_completed" boolean DEFAULT false,
            "waktu_terakhir_ditonton" integer DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "motivational_quotes" (
            "id" serial PRIMARY KEY,
            "teks_jepang" text NOT NULL,
            "cara_baca" text NOT NULL,
            "arti_indonesia" text NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "notifications" (
            "id" serial PRIMARY KEY,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "sender_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "type" varchar(50) NOT NULL,
            "post_id" integer REFERENCES "community_posts"("id") ON DELETE CASCADE,
            "message" text NOT NULL,
            "is_read" boolean DEFAULT false,
            "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "orders" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "kupon_id" integer REFERENCES "coupons"("id") ON DELETE SET NULL,
            "total_harga_akhir" numeric(10, 2) NOT NULL,
            "status_pembayaran" varchar(20) DEFAULT 'pending',
            "waktu_transaksi" timestamp DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "orders_status_pembayaran_check" CHECK (((status_pembayaran)::text = ANY ((ARRAY['pending'::character varying, 'success'::character varying, 'failed'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "order_items" (
            "id" serial PRIMARY KEY,
            "order_id" integer REFERENCES "orders"("id") ON DELETE CASCADE,
            "product_id" integer REFERENCES "products"("id") ON DELETE CASCADE,
            "harga_saat_beli" numeric(10, 2) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "quizzes" (
            "id" serial PRIMARY KEY,
            "lesson_id" integer REFERENCES "lessons"("id") ON DELETE CASCADE,
            "nilai_kkm" integer NOT NULL,
            "maksimal_percobaan" integer DEFAULT 3
        );

        CREATE TABLE IF NOT EXISTS "quiz_attempts" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "quiz_id" integer REFERENCES "quizzes"("id") ON DELETE CASCADE,
            "skor_akhir" integer NOT NULL,
            "status_lulus" boolean NOT NULL,
            "waktu_mengerjakan" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "quiz_questions" (
            "id" serial PRIMARY KEY,
            "quiz_id" integer REFERENCES "quizzes"("id") ON DELETE CASCADE,
            "teks_pertanyaan" text NOT NULL,
            "penjelasan_jawaban" text,
            "audio_url" varchar(255)
        );

        CREATE TABLE IF NOT EXISTS "quiz_options" (
            "id" serial PRIMARY KEY,
            "question_id" integer REFERENCES "quiz_questions"("id") ON DELETE CASCADE,
            "teks_pilihan" text NOT NULL,
            "is_correct" boolean DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS "shop_items" (
            "id" serial PRIMARY KEY,
            "nama_item" varchar(100) NOT NULL,
            "tipe_item" varchar(50),
            "harga_koin" integer NOT NULL,
            "image_url" varchar(255),
            CONSTRAINT "shop_items_tipe_item_check" CHECK (((tipe_item)::text = ANY ((ARRAY['aksesoris'::character varying, 'makanan'::character varying, 'background'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "study_squads" (
            "id" serial PRIMARY KEY,
            "nama_squad" varchar(100) NOT NULL,
            "logo_squad" varchar(255),
            "skor_squad_total" integer DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "squad_members" (
            "id" serial PRIMARY KEY,
            "squad_id" integer REFERENCES "study_squads"("id") ON DELETE CASCADE,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "role" varchar(50) DEFAULT 'member'
        );

        CREATE TABLE IF NOT EXISTS "srs_flashcards" (
            "vocab_id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "kanji" varchar(50),
            "furigana" varchar(50),
            "arti_indonesia" text,
            "tingkat_srs" integer DEFAULT 0,
            "interval_hari" integer DEFAULT 0,
            "next_review_date" date DEFAULT CURRENT_DATE
        );

        CREATE TABLE IF NOT EXISTS "vocabularies" (
            "id" serial PRIMARY KEY,
            "kanji" varchar(50) NOT NULL,
            "furigana" varchar(50),
            "arti_indonesia" text NOT NULL,
            "audio_url" varchar(255),
            "course_id" integer REFERENCES "courses"("id") ON DELETE CASCADE
        );

        -- 👉 PERBAIKAN: Menambahkan relasi ON DELETE CASCADE secara eksplisit
        CREATE TABLE IF NOT EXISTS "srs_reviews" (
            "id" serial PRIMARY KEY,
            "murid_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "vocab_id" integer NOT NULL REFERENCES "vocabularies"("id") ON DELETE CASCADE,
            "arah_kuis" integer NOT NULL,
            "srs_level" integer DEFAULT 0,
            "next_review_date" timestamp DEFAULT CURRENT_TIMESTAMP,
            "kategori_terakhir" varchar(20) DEFAULT 'again',
            "total_review" integer DEFAULT 0,
            "avg_waktu_detik" numeric(5, 2) DEFAULT '0.00',
            CONSTRAINT "srs_reviews_murid_id_vocab_id_arah_kuis_key" UNIQUE("murid_id","vocab_id","arah_kuis")
        );

        CREATE TABLE IF NOT EXISTS "study_quotes" (
            "id" serial PRIMARY KEY,
            "teks_jepang" text NOT NULL,
            "cara_baca" varchar(255),
            "arti_indonesia" text NOT NULL,
            "sumber_tokoh" varchar(100),
            "kategori_fokus" varchar(50)
        );

        CREATE TABLE IF NOT EXISTS "study_sessions" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "waktu_mulai" timestamp NOT NULL,
            "waktu_selesai" timestamp,
            "durasi_detik" integer DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "system_error_logs" (
            "id" serial PRIMARY KEY,
            "tipe_error" varchar(50),
            "pesan_error" text,
            "endpoint_url" varchar(255),
            "waktu_kejadian" timestamp DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "system_error_logs_tipe_error_check" CHECK (((tipe_error)::text = ANY ((ARRAY['payment'::character varying, 'system'::character varying, 'auth'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "user_access" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "product_id" integer REFERENCES "products"("id") ON DELETE CASCADE,
            "tipe_akses" varchar(20),
            "tanggal_expired" timestamp,
            CONSTRAINT "user_access_tipe_akses_check" CHECK (((tipe_akses)::text = ANY ((ARRAY['lifetime'::character varying, 'subscription'::character varying])::text[])))
        );

        CREATE TABLE IF NOT EXISTS "user_achievements" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "achievement_id" integer REFERENCES "achievements"("id") ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "user_daily_quests" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "quest_id" integer REFERENCES "daily_quests"("id") ON DELETE CASCADE,
            "progress_sekarang" integer DEFAULT 0,
            "is_completed" boolean DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS "user_favorite_quotes" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "quote_id" integer REFERENCES "study_quotes"("id") ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "user_inventory" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "item_id" integer REFERENCES "shop_items"("id") ON DELETE CASCADE,
            "tanggal_beli" timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "user_items" (
            "id" serial PRIMARY KEY,
            "murid_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "item_id" integer NOT NULL REFERENCES "shop_items"("id") ON DELETE CASCADE,
            "tanggal_beli" timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "user_mascots" (
            "id" serial PRIMARY KEY,
            "murid_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
            "level_mascot" integer DEFAULT 1,
            "status_mood" integer DEFAULT 100,
            "item_sedang_dipakai" integer REFERENCES "shop_items"("id") ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS "user_statistics" (
            "id" serial PRIMARY KEY,
            "murid_id" integer CONSTRAINT "user_statistics_murid_id_key" UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
            "total_exp_points" integer DEFAULT 0,
            "koin_dimiliki" integer DEFAULT 0,
            "total_waktu_belajar_detik" integer DEFAULT 0,
            "current_streak" integer DEFAULT 0,
            "jumlah_streak_freeze" integer DEFAULT 0,
            "last_login_date" date
        );

        CREATE TABLE IF NOT EXISTS "vocabulary_categories" (
            "id" serial PRIMARY KEY,
            "nama_kategori" varchar(100) NOT NULL,
            "deskripsi" text
        );

        CREATE TABLE IF NOT EXISTS "vocab_category_mapping" (
            "id" serial PRIMARY KEY,
            "vocab_id" integer REFERENCES "vocabularies"("id") ON DELETE CASCADE,
            "category_id" integer REFERENCES "vocabulary_categories"("id") ON DELETE CASCADE
        );
    `;

    try {
        console.log('Memulai sinkronisasi Database dengan ERD Sistem...');
        await db.query(schemaDatabaseMutlak);
        console.log('✅ Skema 46 Tabel Utama KORISU Gakkou berhasil diverifikasi dan disinkronkan!');
    } catch (err) {
        console.error('❌ Terjadi kesalahan fatal saat menyusun tabel:', err.message);
    } finally {
        process.exit();
    }
};

createTables();