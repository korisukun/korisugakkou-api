const tokenSensei = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlbnNlaSIsImlhdCI6MTc4ODU2NTEyMiwiZXhwIjoxNzg4NjUxNTIyfQ.p9agXJ434tbcwZxo6IghtjjjeO_uYSSa_kwI3pu4egc";
const tokenMurid = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im11cmlkIiwiaWF0IjoxNzg4NTY2MzY0LCJleHAiOjE3ODg2NTI3NjR9.kmeY33egfWTul1nM9T5JLkp3FTKBn9i0IGfvdY6ntzc";

const simulasiQuotes = async () => {
    console.log("1. Sensei memasukkan Pepatah (Kotowaza) tentang usaha keras...\n");
    await fetch('http://localhost:5000/api/quotes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenSensei}` },
        body: JSON.stringify({
            teks_jepang: "七転び八起き",
            cara_baca: "Nanakorobi Yaoki",
            arti_indonesia: "Jatuh tujuh kali, bangkit delapan kali. Jangan pernah menyerah!",
            sumber_tokoh: "Pepatah Jepang",
            kategori_fokus: "general"
        })
    });

    console.log("2. Murid membuka dashboard, sistem menarik 1 quote penyemangat secara acak...\n");
    const getRes = await fetch('http://localhost:5000/api/quotes/random', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenMurid}` }
    });
    
    const hasilQuote = await getRes.json();
    console.log("Di layar murid muncul:\n");
    console.log(`"${hasilQuote.quote.teks_jepang}" (${hasilQuote.quote.cara_baca})`);
    console.log(`Artinya: ${hasilQuote.quote.arti_indonesia}`);
    console.log(`- ${hasilQuote.quote.sumber_tokoh}`);
};

simulasiQuotes();