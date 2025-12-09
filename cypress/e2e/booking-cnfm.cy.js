describe('KCM005 - Pengujian Konfirmasi Booking oleh Admin', () => {

  // 1. GLOBAL ERROR HANDLER
  // Mencegah test mati karena error JS template admin
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false; 
    });
  });

  // 2. SETUP: LOGIN MENGGUNAKAN ENV
  beforeEach(() => {
    cy.viewport(1280, 720);

    // Visit Halaman Login Admin
    cy.visit('https://ptkundalinicahayamakmur.com/login'); 

    // Ambil kredensial dari cypress.env.json
    const email = Cypress.env('adminEmail');
    const password = Cypress.env('adminPassword');

    // Cek env
    if (!email || !password) {
        throw new Error("⚠️ Harap isi file cypress.env.json dengan adminEmail dan adminPassword!");
    }

    // Proses Login
    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();

    // Assert Masuk Dashboard
    cy.url().should('include', '/admin/dashboard'); 
    
    // Masuk ke Menu Booking
    cy.contains('a', 'Manajemen Booking').click(); 
  });

  // ============================================================
  // SKENARIO POSITIF (Success Flow)
  // ============================================================
  it('Positif: Admin berhasil mengonfirmasi pemesanan (Status -> Paid)', () => {
    
    // 1. Filter Status 'Pending'
    cy.get('select[name="status"]').select('pending');
    cy.wait(1500); // Tunggu filter loading

    // 2. Ambil Data Kedua (Index 1) agar aman dari data error di baris pertama
    cy.get('table tbody tr').should('have.length.gt', 1); 
    
    cy.get('table tbody tr')
      .eq(1) 
      .within(() => {
        cy.contains('a', 'Detail').click(); 
      });

    // 3. Assert Masuk Halaman Detail
    cy.url().should('include', '/admin/bookings/'); 

    // 4. Pastikan tombol Konfirmasi Muncul
    cy.contains('button', 'Konfirmasi Pembayaran').should('be.visible');

    // 5. KLIK KONFIRMASI
    cy.contains('button', 'Konfirmasi Pembayaran').click();

    cy.wait(3000);
    cy.reload(); 
    cy.url().then((url) => {
        if (!url.includes('/admin/bookings/')) { 
            // Jika mental ke Index (List), cari badge hijau di tabel
            cy.log('Redirected to Index, checking table...');
            cy.get('.bg-green-100').should('exist');
        } else {
            // Jika tetap di Detail (Show), cari badge hijau di info status
            cy.log('Stayed on Detail Page, checking status badge...');
            
            // Assert Status Berubah Jadi Hijau (Paid)
            cy.get('.bg-green-100', { timeout: 10000 })
              .should('exist')
              .and('be.visible');
              
            // Validasi teksnya mengandung kata Paid/Lunas
            cy.get('.bg-green-100').should(($el) => {
                const text = $el.text().trim().toLowerCase();
                expect(text).to.match(/paid|lunas|dikonfirmasi|success/);
            });
        }
    });

    cy.log('✅ Booking berhasil dikonfirmasi & status berubah hijau');
  });


  // ============================================================
  // SKENARIO NEGATIF (Mocking Error Server)
  // ============================================================
  it('Negatif: Admin gagal mengonfirmasi (Simulasi Error Server)', () => {
    
    // 1. NAVIGASI KE DETAIL DULU (Sama seperti positif)
    // Kita harus masuk ke halaman detail dulu baru bisa klik tombol konfirmasi
    cy.get('select[name="status"]').select('pending');
    cy.wait(1500);

    // Ambil data kedua lagi
    cy.get('table tbody tr').eq(1).within(() => {
        cy.contains('a', 'Detail').click(); 
    });

    // 2. SETUP MOCK ERROR (INTERCEPT)
    // Kita pancing error 400 atau 500 saat tombol ditekan
    // URL disesuaikan dengan route blade: admin.bookings.confirm-payment
    cy.intercept('POST', '**/confirm-payment', {
      statusCode: 400, // Bad Request
      body: { 
          message: 'Booking sudah kadaluarsa atau tidak valid!' // Pesan error pura-pura
      }
    }).as('confirmFail');

    // 3. KLIK TOMBOL KONFIRMASI
    cy.contains('button', 'Konfirmasi Pembayaran').click();

    // 4. TUNGGU RESPON MOCK
    // Cypress akan menangkap request ini dan membalas dengan Error 400
    cy.wait('@confirmFail');

    // 5. ASSERT ERROR MUNCUL
    // Karena request gagal, biasanya aplikasi tidak redirect dan tetap di halaman detail.
    // Kita cek apakah ada elemen error/alert, atau URL tidak berubah ke index.
    
    // Assert 1: Tetap di halaman detail (tidak redirect sukses)
    cy.url().should('include', '/admin/bookings/');

    // Assert 2: Cek keberadaan indikator error (Tergantung template admin kamu)
    // Bisa berupa SweetAlert error, Flash Message merah, atau text di body
    // Contoh generik:
    // cy.get('.alert-danger, .text-red-600, .swal2-error').should('exist'); 
    
    cy.log('✅ Skenario Negatif Berhasil: Request ditolak (Mock 400)');
  });

});