const tokenMurid = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im11cmlkIiwiaWF0IjoxNzg4NTY2MzY0LCJleHAiOjE3ODg2NTI3NjR9.kmeY33egfWTul1nM9T5JLkp3FTKBn9i0IGfvdY6ntzc";

const tesJawabKuis = async () => {
    try {
        console.log("Murid menjawab kosakata ID 1 (車椅子) dalam waktu 4 detik...\n");
        const response = await fetch('http://localhost:5000/api/srs/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenMurid}`
            },
            body: JSON.stringify({
                vocab_id: 1, 
                waktu_jawab_detik: 18, // Simulasi murid menjawab sangat cepat
                is_correct: false
            })
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Gagal mengirim jawaban:", error);
    }
};

tesJawabKuis();