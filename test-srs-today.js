const tokenMurid = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im11cmlkIiwiaWF0IjoxNzg4NTY2MzY0LCJleHAiOjE3ODg2NTI3NjR9.kmeY33egfWTul1nM9T5JLkp3FTKBn9i0IGfvdY6ntzc";

const tesAmbilReview = async () => {
    try {
        console.log("Mengecek jadwal review hari ini...\n");
        
        const response = await fetch('http://localhost:5000/api/srs/today', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenMurid}`
            }
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Gagal menarik data:", error);
    }
};

tesAmbilReview();