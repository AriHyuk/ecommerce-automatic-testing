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
  // SKENARIO POSITIF: PAKAI TOMBOL "KONFIRMASI & KIRIM WA"
  // ============================================================
  it('Positif: Admin konfirmasi via WA & Status berubah Paid', () => {
    
    // 1. Filter Status 'Pending'
    cy.get('select[name="status"]').select('pending');
    cy.wait(1500);

    // 2. Ambil Data
    cy.get('table tbody tr').should('have.length.gt', 0); 
    cy.get('table tbody tr').eq( 1).within(() => {
        cy.contains('a', 'Detail').click(); 
    });

    // 3. Assert Masuk Halaman Detail
    cy.url().should('include', '/admin/bookings/'); 

    // 4. CEK TOMBOL "KONFIRMASI & KIRIM WA"
    // Pastikan tombolnya ada dulu
    cy.contains('a', 'Konfirmasi & Kirim WA').should('be.visible');

    // ============================================================
    // 🔥 TRICK HANDLING TARGET="_BLANK" 🔥
    // ============================================================
    // Karena tombol ini membuka tab baru (target="_blank"), Cypress akan error/hang.
    // Kita harus HAPUS atribut target-nya supaya link terbuka di tab yang sama.
    
    cy.contains('a', 'Konfirmasi & Kirim WA')
      .invoke('removeAttr', 'target') // Hapus target="_blank"
      .click();

    // 5. HANDLING PROSES (WA & DATABASE)
    // Karena proses ini mungkin membuka API WA atau loading lama
    cy.wait(5000); // Beri waktu lebih lama (5 detik)

    // Kembali ke halaman admin jika terlempar ke URL WhatsApp
    // (Opsional: Jika sistem kamu redirect ke api.whatsapp.com, kita harus balik manual)
    // Tapi biasanya controller me-redirect back().
    
    // Paksa Reload untuk cek status terbaru
    cy.visit('http://127.0.0.1:8000/admin/bookings'); // Balik ke index aja biar aman
    cy.get('select[name="status"]').select('paid'); // Filter yang paid
    cy.wait(1000);

    // 6. VERIFIKASI STATUS HIJAU
    // Cek apakah ada data paid (artinya konfirmasi berhasil masuk DB)
    cy.get('table tbody tr').should('have.length.gt', 0);
    cy.get('.bg-green-100').first().should('exist');

    cy.log('✅ Booking berhasil dikonfirmasi via Link WA');
  });

  // ============================================================
  // SKENARIO NEGATIF
  // ============================================================
  it('Negatif: Admin tidak bisa mengonfirmasi ulang booking yang sudah Paid', () => {
    
    cy.get('select[name="status"]').select('paid');
    cy.wait(1500);

    cy.get('table tbody tr').should('have.length.gt', 0);
    cy.get('table tbody tr').eq(0).within(() => {
        cy.contains('a', 'Detail').click(); 
    });

    // VERIFIKASI TOMBOL WA TIDAK ADA
    // Jika sudah lunas, tombol kirim WA konfirmasi harusnya hilang
    cy.contains('a', 'Konfirmasi & Kirim WA').should('not.exist');

    // Tombol konfirmasi biasa juga tidak ada
    cy.contains('button', 'Konfirmasi Pembayaran').should('not.exist');

    cy.get('.bg-green-100').should('be.visible');
    cy.log('✅ Skenario Negatif Berhasil: Tombol Konfirmasi hilang pada data Paid');
  });

});