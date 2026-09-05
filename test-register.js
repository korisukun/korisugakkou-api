const testDaftar = async () => {
    console.log("1. Menghubungi server...");
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama_lengkap: "Sensei Cholis",
                email: "sensei@korisugakkou.com",
                password: "passwordrahasia123",
                role: "sensei"
            })
        });

        console.log("2. Membaca respons server...");
        const data = await response.json();
        console.log("Status HTTP:", response.status);
        console.log("Balasan:", data);
    } catch (error) {
        console.error("Gagal menghubungi server:", error);
    }
};
testDaftar();