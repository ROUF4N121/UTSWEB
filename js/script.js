(function () {
  'use strict';

  // ====== Utility Session ======
  function setSession(user) {
    localStorage.setItem('userSession', JSON.stringify(user));
  }

  function getSession() {
    return JSON.parse(localStorage.getItem('userSession') || 'null');
  }

  function clearSession() {
    localStorage.removeItem('userSession');
  }
  

  // ====== Autentikasi dan Cek Role ======


  function checkAuthAndRole() {
    const user = getSession();
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Cek Autentikasi
    if (!user && !isLoginPage) {
        window.location.href = 'login.html';
    }

    // Cek role
    const adminLinks = document.querySelectorAll('.admin-only-link');
    if (adminLinks.length > 0) {
        if (!user || user.role !== 'Admin') {
            adminLinks.forEach(link => link.style.display = 'none');
        } else {
            adminLinks.forEach(link => link.style.display = 'block');
        }
    }
  }

  // Jalankan otentikasi
  checkAuthAndRole();



  // ====== LOGIN ======

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('closeModal');

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const user = dataPengguna.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        alert('Email atau password yang Anda masukkan salah!');
        return;
      }

      setSession({
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      });
      window.location.href = 'dashboard.html';
    });

    // Lupa password
    document.getElementById('forgotBtn').addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('modal-title').textContent = 'Lupa Password';
      modalBody.innerHTML = `
        <p class="small-muted">Masukkan email Anda untuk reset password (simulasi)</p>
        <input id="resetEmail" placeholder="Email">
        <button id="sendReset">Kirim</button>
      `;
      document.getElementById('sendReset').addEventListener('click', () => {
        alert('Link reset dikirim'); // simulasi
        modal.setAttribute('aria-hidden', 'true');
      });
    });

    // Daftar akun
    document.getElementById('registerBtn').addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('modal-title').textContent = 'Daftar Akun Baru';
      modalBody.innerHTML = `
        <form id="registrationForm">
            <label for="rname">Nama</label>
            <input id="rname" placeholder="Nama Lengkap" type="text">

            <label for="remail">Email</label>
            <input id="remail" placeholder="Email" type="email">

            <label for="rpass">Password</label>
            <input id="rpass" type="password" placeholder="Password">

            <button id="doRegister" type="submit">Daftar</button>
        </form>
      `;
      document.getElementById('doRegister').addEventListener('click', () => {
        const name = document.getElementById('rname').value;
        const email = document.getElementById('remail').value;
        const pass = document.getElementById('rpass').value;
        if (!email || !pass) {
          alert('Email dan password wajib diisi!');
          return;
        }
        const exists = dataPengguna.find((u) => u.email === email);
        if (exists) {
          alert('Email sudah terdaftar!');
          return;
        }
        const id = dataPengguna.length + 1;
        dataPengguna.push({
          id,
          nama: name || 'User Baru',
          email,
          password: pass,
          role: 'User',
        });
        alert('Pendaftaran berhasil. Silakan login.'); //simulasi
        modal.setAttribute('aria-hidden', 'true');
      });
    });

    closeModal.addEventListener('click', () =>
      modal.setAttribute('aria-hidden', 'true')
    );
  }


  // ====== DASHBOARD ======

    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Selamat malam';
        if (hour >= 4 && hour < 11) greeting = 'Selamat pagi';
        else if (hour >= 11 && hour < 15) greeting = 'Selamat siang';
        else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';

    const user = getSession();
        greetingEl.textContent = `${greeting}, ${user ? user.nama : 'Pengunjung'}`;
        document.getElementById('greeting-sub').textContent =
        'Waktu lokal: ' + now.toLocaleString('id-ID');

        // Role User di Navbar
        const roleIndicator = document.getElementById('userRoleIndicator');
        if (roleIndicator && user) {
            roleIndicator.textContent = user.role.toUpperCase();
            roleIndicator.style.fontWeight = 'bold';
            if (user.role === 'Admin') {
                roleIndicator.style.color = '#FFA500';
            } else {
                roleIndicator.style.color = '#FFFFFF';
        }
    }


    // Sembunyikan Kartu Laporan Pemesanan (Hanya untuk Admin) **
    document.querySelectorAll('.catalog article.card h4 a').forEach(link => {
        if (link.textContent.includes('Laporan Pemesanan')) {
            const laporanCard = link.closest('.card');
            
            if (laporanCard && (!user || user.role !== 'Admin')) {
                // Sembunyikan jika BUKAN Admin
                laporanCard.style.display = 'none';
            }
        }
    });

    const logout = document.getElementById('logout');
    if (logout)
      logout.addEventListener('click', () => {
        clearSession();
        window.location.href = 'login.html';
      });
  }


  // ====== STOK / KATALOG ======

  const catalogEl = document.getElementById('catalog');
  if (catalogEl) {

    // Ambil data user yang sedang login
    const currentUser = getSession();
    
    // Tentukan elemen form penambahan stok
    const addStockSection = document.querySelector('section[aria-labelledby="add-heading"]');
    const addStockForm = document.getElementById('addStockForm');
    
    // Cek Role
    if (addStockSection && (!currentUser || currentUser.role !== 'Admin')) {
        addStockSection.style.display = 'none';
    }

    function renderCatalog() {
      catalogEl.innerHTML = '';
      dataKatalogBuku.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${item.cover || 'img/placeholder.png'}" alt="${item.namaBarang}" class="cover">
        <h4>${item.namaBarang}</h4>
        <p class="small-muted">Kode: <strong>${item.kodeBarang}</strong></p>
        <p class="small-muted">${item.jenisBarang} • Edisi ${item.edisi}</p>
        <p>Stok: <strong>${item.stok}</strong></p>
        <p>Harga: <strong>${item.harga}</strong></p>
      `;
      catalogEl.appendChild(div);
    });
  }

    renderCatalog();

    // Tambah stok baru (admin)
    if (addStockForm && currentUser && currentUser.role === 'Admin') {
      addStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const kode = document.getElementById('kode').value.trim();
        const nama = document.getElementById('nama').value.trim();
        const jenis = document.getElementById('jenis').value.trim();
        const edisi = document.getElementById('edisi').value.trim();
        const stok = parseInt(document.getElementById('stok').value, 10) || 0;
        const harga = document.getElementById('harga').value.trim();

        if (!kode || !nama) {
          alert('Kode dan Nama Barang wajib diisi!');
          return;
        }

        dataKatalogBuku.push({
          kodeBarang: kode,
          namaBarang: nama,
          jenisBarang: jenis,
          edisi,
          stok,
          harga,
          cover: 'img/placeholder.png',
        });

        alert('Stok baru berhasil ditambahkan!');
        addStockForm.reset();
        renderCatalog();
      });
    }
  }

  
  // ====== CHECKOUT ======
  
  const selectBook = document.getElementById('selectBook');
  if (selectBook) {
    dataKatalogBuku.forEach((b, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${b.namaBarang} — ${b.harga}`;
      selectBook.appendChild(opt);
    });

    const cart = [];
    const cartBody = document.querySelector('#cartTable tbody');
    const totalPriceEl = document.getElementById('totalPrice');

    function renderCart() {
      cartBody.innerHTML = '';
      let total = 0;

      cart.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.nama}</td>
          <td>${item.qty}</td>
          <td>${item.harga}</td>
          <td><button class="remove" data-index="${index}">Hapus</button></td>
        `;
        cartBody.appendChild(tr);
        total +=
          parseInt(item.harga.replace(/[^0-9]/g, ''), 10) * parseInt(item.qty);
      });

      totalPriceEl.textContent = 'Total: Rp ' + total.toLocaleString('id-ID');

      // Event hapus
      document.querySelectorAll('.remove').forEach((btn) =>
        btn.addEventListener('click', () => {
          cart.splice(btn.dataset.index, 1);
          renderCart();
        })
      );
    }

    document.getElementById('addItem').addEventListener('click', () => {
      const idx = parseInt(selectBook.value);
      const qty = parseInt(document.getElementById('quantity').value) || 1;
      const book = dataKatalogBuku[idx];
      if (!book) {
        alert('Pilih buku yang valid!');
        return;
      }
      cart.push({
        nama: book.namaBarang,
        qty,
        harga: book.harga,
      });
      renderCart();
    });

    document.getElementById('orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
      }
      alert('Pesanan diterima (simulasi). Terima kasih!');
      cart.length = 0;
      renderCart();
      e.target.reset();
    });
  }


  // ====== TRACKING ======

  const trackForm = document.getElementById('trackForm');
  if (trackForm) {
    const result = document.getElementById('trackResult');
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const no = document.getElementById('doNumber').value.trim();
      const data = dataTracking[no];
      if (!data) {
        result.innerHTML = `<p>Nomor DO <strong>${no}</strong> tidak ditemukan!</p>`;
        return;
      }

      result.innerHTML = `
        <h3>Nomor DO: ${data.nomorDO}</h3>
        <p>Nama: ${data.nama}</p>
        <p>Status: <strong>${data.status}</strong></p>
        <p>Ekspedisi: ${data.ekspedisi} | Paket: ${data.paket}</p>
        <p>Tanggal Kirim: ${data.tanggalKirim}</p>
        <p>Total: ${data.total}</p>
        <h4>Riwayat Perjalanan:</h4>
        <ol>
          ${data.perjalanan
            .map(
              (p) =>
                `<li><time>${p.waktu}</time> — ${p.keterangan}</li>`
            )
            .join('')}
        </ol>
      `;
    });
  }
})();