const db = require('../config/db');

// 1. Ambil Postingan
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

// 2. Buat Postingan Baru
const createPost = async (req, res) => {
    const { konten } = req.body;
    if (!konten || konten === '<p><br></p>') return res.status(400).json({ message: 'Postingan tidak boleh kosong.' });
    try {
        await db.query('INSERT INTO community_posts (user_id, konten) VALUES ($1, $2)', [req.user.id, konten]);
        res.status(201).json({ message: 'Postingan berhasil diterbitkan!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. Edit Postingan (Hanya Penulis)
const editPost = async (req, res) => {
    const { id } = req.params;
    const { konten } = req.body;
    try {
        const post = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
        if (post.rows.length === 0) return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        if (post.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Akses ditolak.' });

        await db.query('UPDATE community_posts SET konten = $1 WHERE id = $2', [konten, id]);
        res.json({ message: 'Postingan berhasil diperbarui! ✅' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 4. Hapus Postingan (Penulis OR Sensei/Admin)
const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
        if (post.rows.length === 0) return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        if (post.rows[0].user_id !== req.user.id && req.user.role !== 'sensei' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        await db.query('DELETE FROM community_posts WHERE id = $1', [id]);
        res.json({ message: 'Postingan berhasil dihapus! 🗑️' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 5. Tombol Like
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

// [PERBAIKAN] 6. Ambil Komentar (Tarik ID dan Parent ID)
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

// [PERBAIKAN] 7. Kirim Komentar (Bisa menerima parent_id)
const addComment = async (req, res) => {
    const { post_id, komentar, parent_id } = req.body;
    if (!komentar) return res.status(400).json({ message: 'Komentar kosong.' });
    try {
        await db.query(
            'INSERT INTO community_comments (post_id, user_id, komentar, parent_id) VALUES ($1, $2, $3, $4)', 
            [post_id, req.user.id, komentar, parent_id || null]
        );
        res.status(201).json({ message: 'Komentar dikirim!' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getPosts, createPost, editPost, deletePost, toggleLike, getComments, addComment };