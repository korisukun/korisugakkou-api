const getCourses = async (req, res) => {
    try {
        // Data sementara. Nantinya ini bisa dengan mudah dipindahkan ke database Neon.
        const daftarMateri = [
            { 
                id: 1, 
                judul: "Materi 1: Pengantar Kaigo Kokka Shiken", 
                deskripsi: "Mengenal dasar-dasar ujian nasional keperawatan lansia di Jepang beserta format soalnya.",
                url_video: "https://www.youtube.com/embed/jfKfPfyJRdk" // Ganti dengan ID video YouTube Anda
            },
            { 
                id: 2, 
                judul: "Materi 2: Kosakata Mobilitas (Alat Bantu Jalan)", 
                deskripsi: "Membahas tuntas kanji dan kosakata terkait dukungan pergerakan pasien.",
                url_video: "https://www.youtube.com/embed/jfKfPfyJRdk"
            }
        ];

        res.status(200).json({ 
            message: 'Berhasil memuat materi video 🐿️', 
            materi: daftarMateri 
        });
    } catch (error) {
        console.error('Error muat materi:', error.message);
        res.status(500).json({ message: 'Gagal memuat materi kelas.' });
    }
};

module.exports = { getCourses };