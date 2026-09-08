const db = require('../config/db');

const getPosts = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.id, p.user_id, p.konten, p.created_at, u.nama_lengkap, u.role,
                   (SELECT COUNT(*) FROM community_likes WHERE post_id = p.id) as total_likes,
                   (SELECT COUNT(*) FROM community_comments WHERE post_id = p.id) as total_comments,
                   EXISTS(SELECT 1 FROM community_likes WHERE post_id = p.id AND user_id = $1) as is_liked
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC LIMIT 50
        `, [req.user.id]);
        res.json({ posts: result.rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createPost = async (req, res) => {
    const { konten } = req.body;
    if (!konten || konten === '<p><br></p>') return res.status(400).json({ message: 'Postingan tidak boleh kosong.' });
    try {
        await db.query('INSERT INTO community_posts (user_id, konten) VALUES ($1, $2)', [req.user.id, konten]);
        res.status(201).json({ message: 'Postingan berhasil diterbitkan!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const editPost = async (req, res) => {
    const { id } = req.params;
    const { konten } = req.body;
    try {
        const post = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
        if (post.rows.length === 0) return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        if (post.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Akses ditolak.' });

        await db.query('UPDATE community_posts SET konten = $1 WHERE id = $2', [konten, id]);
        res.json({ message: 'Postingan diperbarui! ✅' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
        if (post.rows.length === 0) return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        if (post.rows[0].user_id !== req.user.id && req.user.role !== 'sensei' && req.user.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak.' });

        await db.query('DELETE FROM community_posts WHERE id = $1', [id]);
        res.json({ message: 'Postingan dihapus! 🗑️' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const toggleLike = async (req, res) => {
    const { post_id } = req.body;
    try {
        const cek = await db.query('SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2', [post_id, req.user.id]);
        if (cek.rows.length > 0) {
            await db.query('DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2', [post_id, req.user.id]);
            res.json({ message: 'Unliked', is_liked: false });
        } else {
            await db.query('INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)', [post_id, req.user.id]);
            res.json({ message: 'Liked', is_liked: true });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getComments = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.id, c.parent_id, c.komentar, c.created_at, u.nama_lengkap, u.role
            FROM community_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [req.params.post_id]);
        res.json({ comments: result.rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// [PERBAIKAN] Deteksi Mention (@) dan Kirim Notifikasi
const addComment = async (req, res) => {
    const { post_id, komentar, parent_id } = req.body;
    if (!komentar) return res.status(400).json({ message: 'Komentar kosong.' });
    try {
        await db.query(
            'INSERT INTO community_comments (post_id, user_id, komentar, parent_id) VALUES ($1, $2, $3, $4)', 
            [post_id, req.user.id, komentar, parent_id || null]
        );

        // Mesin Pendeteksi Mention: Mengekstrak nama setelah tanda '@'
        const mentionMatch = komentar.match(/@([a-zA-Z0-9_ ]+)/);
        if (mentionMatch) {
            let namaMention = mentionMatch[1].trim();
            // Cari ID user yang disebutkan (menggunakan ILIKE untuk kecocokan parsial)
            const userRes = await db.query('SELECT id FROM users WHERE nama_lengkap ILIKE $1 LIMIT 1', [`%${namaMention}%`]);
            
            // Jika user ditemukan dan dia tidak mention dirinya sendiri
            if (userRes.rows.length > 0 && userRes.rows[0].id !== req.user.id) {
                await db.query(
                    "INSERT INTO notifications (user_id, sender_id, type, post_id, message) VALUES ($1, $2, 'mention', $3, $4)",
                    [userRes.rows[0].id, req.user.id, post_id, 'membalas dan menyebut Anda di komunitas.']
                );
            }
        }

        res.status(201).json({ message: 'Komentar dikirim!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// [BARU] Mengambil Daftar Notifikasi
const getNotifications = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT n.id, n.type, n.message, n.is_read, n.created_at, n.post_id, u.nama_lengkap as sender_name
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC LIMIT 15
        `, [req.user.id]);
        res.json({ notifications: result.rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// [BARU] Menandai Notifikasi Telah Dibaca
const markNotificationsRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Read' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getPosts, createPost, editPost, deletePost, toggleLike, getComments, addComment, getNotifications, markNotificationsRead };