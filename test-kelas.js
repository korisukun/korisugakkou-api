const testBukaKelas = async () => {
    try {
        // Masukkan token JWT yang Anda dapatkan dari test-login.js sebelumnya
        const tokenMurid = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im11cmlkIiwiaWF0IjoxNzg4NDk1ODE1LCJleHAiOjE3ODg1ODIyMTV9.VDpZdjInJ-fmzV0p63sbiD15p1F22jQfd1dgqQL04ks"; 

        const response = await fetch('http://localhost:5000/api/lms/materi-eksklusif', {
            method: 'GET', // GET karena kita hanya meminta data, bukan mengirim form
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenMurid}` // Menyerahkan tiket VIP ke satpam
            }
        });

        const data = await response.json();
        console.log("Status HTTP:", response.status);
        console.log("Balasan Server:", data);
        
    } catch (error) {
        console.error("Koneksi gagal:", error);
    }
};

testBukaKelas();