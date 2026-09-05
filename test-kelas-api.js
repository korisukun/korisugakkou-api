const tokenSensei = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlbnNlaSIsImlhdCI6MTc4ODU2NTEyMiwiZXhwIjoxNzg4NjUxNTIyfQ.p9agXJ434tbcwZxo6IghtjjjeO_uYSSa_kwI3pu4egc"; // Paste di antara tanda kutip

const tesFiturKelas = async () => {
    console.log("1. MENGUNGGAH KELAS BARU...");
    try {
        const postRes = await fetch('http://localhost:5000/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenSensei}`
            },
            body: JSON.stringify({
                judul_course: "Kaigo Kokka Shiken - Modul Dasar",
                deskripsi: "Kelas intensif persiapan ujian Kaigo Kokka Shiken.",
                thumbnail_url: "https://korisugakkou.com/images/kaigo.jpg"
            })
        });
        const postData = await postRes.json();
        console.log("Hasil Post:", postData, "\n");

        console.log("2. MENGAMBIL DAFTAR KELAS...");
        const getRes = await fetch('http://localhost:5000/api/courses', {
            method: 'GET'
        });
        const getData = await getRes.json();
        console.log("Hasil Get:", getData);
    } catch (error) {
        console.error("Error:", error);
    }
};

tesFiturKelas();