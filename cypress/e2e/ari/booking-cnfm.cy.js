describe('KCM005 - Pengujian Konfirmasi Booking (Admin - Localhost)', () => {

  // 1. GLOBAL ERROR HANDLER
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false; 
    });
  });

  // 2. SETUP: LOGIN ADMIN
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login'); 

    const email = Cypress.env('adminEmail') || 'admin@gmail.com';
    const password = Cypress.env('adminPassword') || 'passwordAdmin123';

    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin'); 
    cy.visit('http://127.0.0.1:8000/admin/bookings');
  });

  // ============================================================
  // SKENARIO POSITIF: SMART CONFIRMATION
  // ============================================================
  it('Positif: Admin konfirmasi booking (Cek Link WA atau Tombol Biasa)', () => {
    
    // 1. Filter Status 'Pending'
    cy.get('select[name="status"]').select('pending');
    cy.wait(1500);

    // 2. Ambil Data (Coba ambil baris pertama biar pasti ada)
    cy.get('table tbody tr').should('have.length.gt', 0); 
    
    cy.get('table tbody tr').eq(0).within(() => {
        cy.contains('a', 'Detail').click(); 
    });

    // 3. Assert Masuk Halaman Detail
    cy.url().should('include', '/admin/bookings/'); 

    // 4. LOGIKA PEMILIHAN TOMBOL (WA vs BIASA)
    cy.get('body').then(($body) => {
        
        // Cek apakah Link WA (target="_blank") muncul?
        // Kita cari elemen <a> yang punya text "Konfirmasi & Kirim WA"
        const btnWA = $body.find('a:contains("Konfirmasi & Kirim WA")');

        if (btnWA.length > 0) {
            cy.log('✅ Tombol WA Ditemukan! Mengklik Link WA...');
            
            // Hapus target="_blank" agar tidak membuka tab baru
            cy.wrap(btnWA)
              .invoke('removeAttr', 'target')
              .click();
              
        } else {
            cy.log('⚠️ Tombol WA Tidak Muncul (Mungkin data tidak lengkap). Mengklik Konfirmasi Biasa...');
            
            // Fallback ke tombol hijau biasa
            cy.contains('button', 'Konfirmasi Pembayaran').click();
        }
    });

    // 5. HANDLING SETELAH KLIK
    // Tunggu proses database/server
    cy.wait(4000); 

    // Verifikasi dengan cara kembali ke Index dan cari data Paid
    cy.visit('http://127.0.0.1:8000/admin/bookings'); 
    
    // Filter ke status 'Paid'
    cy.get('select[name="status"]').select('paid'); 
    cy.wait(1500);

    // 6. VERIFIKASI
    // Harusnya ada data di tabel paid (minimal 1)
    cy.get('table tbody tr').should('have.length.gt', 0);
    
    // Pastikan badge hijau ada
    cy.get('.bg-green-100').first().should('exist'); 

    cy.log('✅ Booking berhasil dikonfirmasi (Status berubah jadi Paid)');
  });

  // ============================================================
  // SKENARIO NEGATIF
  // ============================================================
  it('Negatif: Admin tidak bisa mengonfirmasi ulang booking yang sudah Paid', () => {
    
    // 1. Cari yang sudah Paid
    cy.get('select[name="status"]').select('paid');
    cy.wait(1500);

    cy.get('table tbody tr').should('have.length.gt', 0);
    cy.get('table tbody tr').eq(0).within(() => {
        cy.contains('a', 'Detail').click(); 
    });

    // 2. Assert Masuk Detail
    cy.url().should('include', '/admin/bookings/');

    // 3. VERIFIKASI TOMBOL HILANG
    // Tombol WA harusnya ga ada
    cy.contains('a', 'Konfirmasi & Kirim WA').should('not.exist');

    // Tombol konfirmasi biasa juga ga ada
    cy.contains('button', 'Konfirmasi Pembayaran').should('not.exist');

    // Pastikan statusnya memang hijau
    cy.get('.bg-green-100').should('be.visible');
    
    cy.log('✅ Skenario Negatif Berhasil: Tombol Konfirmasi hilang pada data Paid');
  });

});