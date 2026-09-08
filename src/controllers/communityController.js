const db = require('../config/db');

// 1. Ambil Postingan (beserta jumlah like, komen, dan status like si user)
const getPosts = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.id, p.konten, p.created_at, u.nama_lengkap, u.role,
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

// 2. Buat Postingan Baru
const createPost = async (req, res) => {
    const { konten } = req.body;
    if (!konten || konten === '<p><br></p>') return res.status(400).json({ message: 'Postingan tidak boleh kosong.' });
    try {
        await db.query('INSERT INTO community_posts (user_id, konten) VALUES ($1, $2)', [req.user.id, konten]);
        res.status(201).json({ message: 'Postingan berhasil diterbitkan!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. Tombol Like (Sistem Toggle: Klik 1x Like, Klik 2x Unlike)
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

// 4. Ambil Komentar Spesifik untuk 1 Post
const getComments = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.komentar, c.created_at, u.nama_lengkap, u.role
            FROM community_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [req.params.post_id]);
        res.json({ comments: result.rows });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 5. Kirim Komentar
const addComment = async (req, res) => {
    const { post_id, komentar } = req.body;
    if (!komentar) return res.status(400).json({ message: 'Komentar kosong.' });
    try {
        await db.query('INSERT INTO community_comments (post_id, user_id, komentar) VALUES ($1, $2, $3)', [post_id, req.user.id, komentar]);
        res.status(201).json({ message: 'Komentar dikirim!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getPosts, createPost, toggleLike, getComments, addComment };