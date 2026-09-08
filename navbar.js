class KorisuNavbar extends HTMLElement {
    connectedCallback() {
        // 1. Deteksi halaman saat ini agar menu yang aktif menyala
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        
        // 2. Ambil data koin murid dari Local Storage
        const user = JSON.parse(localStorage.getItem('korisu_user') || '{}');
        const koin = user.koin || 0;

        // 3. Render HTML dan CSS Navigasi
        this.innerHTML = `
        <style>
            .nav-wrapper-global { padding-top: 25px; margin-bottom: 20px; }
            .navbar-custom-global { 
                background-color: #ff7f00; padding: 15px 25px; border-radius: 20px;
                box-shadow: 0 10px 25px rgba(255, 127, 0, 0.2); display: flex; align-items: center; justify-content: space-between;
            }
            .nav-link-global {
                color: rgba(255, 255, 255, 0.8) !important; font-weight: 600; margin: 0 15px;
                font-size: 0.95rem; position: relative; text-decoration: none; transition: color 0.2s;
            }
            .nav-link-global:hover, .nav-link-global.active { color: #ffffff !important; }
            .nav-link-global.active::after {
                content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
                width: 20px; height: 3px; background-color: #ffffff; border-radius: 3px;
            }
            .btn-nav-outline-global {
                background-color: #ffffff; color: #ff7f00; font-weight: bold; border-radius: 25px;
                padding: 8px 25px; border: none; transition: all 0.2s; cursor: pointer; text-decoration: none;
            }
            .btn-nav-outline-global:hover { background-color: #f8f9fa; transform: translateY(-2px); }
            .stats-top-global { 
                background: rgba(255,255,255,0.2); padding: 6px 15px; border-radius: 20px; 
                font-weight: 600; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.3); color: white;
            }
        </style>
        
        <div class="container nav-wrapper-global">
            <nav class="navbar-custom-global d-flex w-100">
                <!-- Logo -->
                <a href="dashboard.html" style="text-decoration: none;">
                    <div style="background: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🐿️</div>
                </a>
                
                <!-- Menu Tengah -->
                <div class="d-none d-lg-flex mx-auto">
                    <a href="dashboard.html" class="nav-link-global ${currentPage.includes('dashboard') ? 'active' : ''}">Dasbor</a>
                    <a href="kelas.html" class="nav-link-global ${currentPage.includes('kelas') ? 'active' : ''}">Kelas / Kurikulum</a>
                    <a href="toko.html" class="nav-link-global ${currentPage.includes('toko') ? 'active' : ''}">Layanan Toko</a>
                    <a href="#" class="nav-link-global">Komunitas</a>
                </div>
                
                <!-- Koin & Logout -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="stats-top-global" title="Total Koin">🪙 <span>${koin}</span></span>
                    <button class="btn-nav-outline-global ms-2" onclick="logoutGlobal()">Keluar</button>
                </div>
            </nav>
        </div>
        `;
    }
}

// Daftarkan elemen HTML kustom
customElements.define('korisu-navbar', KorisuNavbar);

// Fungsi Logout Universal
function logoutGlobal() {
    localStorage.removeItem('korisu_token');
    localStorage.removeItem('korisu_user');
    window.location.href = "auth.html";
}