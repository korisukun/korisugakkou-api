const tesAmbilKurikulum = async () => {
    try {
        console.log("Menarik data Kelas ID 1 dari database...\n");
        
        // Kita memanggil URL dengan tambahan angka 1 di belakangnya
        const response = await fetch('http://localhost:5000/api/courses/1', {
            method: 'GET'
        });

        const data = await response.json();
        
        // Mencetak hasilnya dengan format rapi (bertingkat)
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Gagal menarik data:", error);
    }
};

tesAmbilKurikulum();