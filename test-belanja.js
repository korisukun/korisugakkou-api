const tokenSensei = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlbnNlaSIsImlhdCI6MTc4ODU2NTEyMiwiZXhwIjoxNzg4NjUxNTIyfQ.p9agXJ434tbcwZxo6IghtjjjeO_uYSSa_kwI3pu4egc";
const tokenMurid = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im11cmlkIiwiaWF0IjoxNzg4NTY2MzY0LCJleHAiOjE3ODg2NTI3NjR9.kmeY33egfWTul1nM9T5JLkp3FTKBn9i0IGfvdY6ntzc";

const simulasiToko = async () => {
    console.log("1. Sensei menambahkan 'Kacamata Hitam' ke Toko seharga 3 Koin...");
    await fetch('http://localhost:5000/api/shop/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenSensei}` },
        body: JSON.stringify({
            nama_item: "Kacamata Hitam Tupai",
            tipe_item: "aksesoris",
            harga_koin: 3,
            image_url: "kacamata.png"
        })
    });
    console.log("Barang berhasil dipajang!\n");

    console.log("2. Murid mencoba membeli barang tersebut...");
    const beliRes = await fetch('http://localhost:5000/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenMurid}` },
        body: JSON.stringify({ item_id: 1 })
    });
    
    const hasilBeli = await beliRes.json();
    console.log("Respons Kasir:", hasilBeli);
};

simulasiToko();