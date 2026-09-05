const tokenSensei = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlbnNlaSIsImlhdCI6MTc4ODU2NTEyMiwiZXhwIjoxNzg4NjUxNTIyfQ.p9agXJ434tbcwZxo6IghtjjjeO_uYSSa_kwI3pu4egc"; 

const tesUploadVideo = async () => {
    try {
        console.log("1. MEMBUAT BAB (MODUL) BARU...");
        const resModul = await fetch('http://localhost:5000/api/curriculum/module', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenSensei}`
            },
            body: JSON.stringify({
                course_id: 1, // ID kelas pertama Anda
                judul_modul: "Bab 1: Kosakata Perawatan Lansia",
                urutan_modul: 1
            })
        });
        const dataModul = await resModul.json();
        console.log("Hasil:", dataModul, "\n");

        // Mengambil ID modul yang baru saja dibuat
        const idModulBaru = dataModul.module.id; 

        console.log("2. MEMASUKKAN VIDEO YOUTUBE KE DALAM BAB TERSEBUT...");
        const resVideo = await fetch('http://localhost:5000/api/curriculum/video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenSensei}`
            },
            body: JSON.stringify({
                module_id: idModulBaru,
                judul_materi: "Video 1: Pengenalan Alat Bantu Jalan",
                tipe_lesson: "video_youtube",
                konten_url: "dQw4w9WgXcQ", // Ini contoh ID YouTube
                urutan_lesson: 1
            })
        });
        const dataVideo = await resVideo.json();
        console.log("Hasil:", dataVideo);

    } catch (error) {
        console.error("Error:", error);
    }
};

tesUploadVideo();