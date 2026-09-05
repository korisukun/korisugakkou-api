const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: "murid@korisugakkou.com",
                password: "passwordrahasia123"
            })
        });

        const data = await response.json();
        console.log("Status HTTP:", response.status);
        console.log("Balasan dari Server:", data);
        
        if(data.token) {
            console.log("\n🔑 INI ADALAH TOKEN JWT ANDA:");
            console.log(data.token);
        }
    } catch (error) {
        console.error("Gagal menghubungi server:", error);
    }
};

testLogin();