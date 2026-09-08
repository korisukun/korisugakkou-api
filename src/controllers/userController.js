const db = require('../config/db');

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { nama_lengkap } = req.body;

    if (!nama_lengkap) {
        return res.status(400).json({ message: 'Nama lengkap tidak boleh kosong.' });
    }

    try {
        // Melakukan Update hanya pada kolom nama_lengkap
        const result = await db.query(
            'UPDATE users SET nama_lengkap = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, nama_lengkap, email, role',
            [nama_lengkap, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Akun tidak ditemukan.' });
        }

        res.json({
            message: 'Profil berhasil diperbarui! ✅',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error update profil:', error.message);
        res.status(500).json({ message: 'Gagal memperbarui profil di server.' });
    }
};

module.exports = { updateProfile };