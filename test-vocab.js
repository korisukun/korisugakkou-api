const tokenSensei = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlbnNlaSIsImlhdCI6MTc4ODU2NTEyMiwiZXhwIjoxNzg4NjUxNTIyfQ.p9agXJ434tbcwZxo6IghtjjjeO_uYSSa_kwI3pu4egc"; 

const tesBankKosakata = async () => {
    try {
        console.log("1. MEMBUAT KATEGORI...");
        const resCat = await fetch('http://localhost:5000/api/vocabulary/category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenSensei}` },
            body: JSON.stringify({
                nama_kategori: "Kaigo Kokka Shiken",
                deskripsi: "Kosakata spesifik untuk ujian perawat lansia"
            })
        });
        const dataCat = await resCat.json();
        console.log("Hasil:", dataCat, "\n");

        const idKategoriBaru = dataCat.kategori.id;

        console.log("2. MENAMBAH KOSAKATA KE KATEGORI TERSEBUT...");
        const resVocab = await fetch('http://localhost:5000/api/vocabulary/word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenSensei}` },
            body: JSON.stringify({
                kanji: "車椅子",
                furigana: "くるまいす",
                arti_indonesia: "Kursi Roda",
                category_id: idKategoriBaru
            })
        });
        const dataVocab = await resVocab.json();
        console.log("Hasil:", dataVocab);

    } catch (error) {
        console.error("Error:", error);
    }
};

tesBankKosakata();