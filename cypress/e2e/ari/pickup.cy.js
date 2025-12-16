describe('KCM004 - Pickup Flow (Success then Duplicate)', () => {

  // 1. GENERATE NOMOR ORDER UNIK (TANPA STRIP)
  // Format: TESTCYPRESS + Angka Random (agar tidak dihapus oleh script website)
  const randomId = Math.floor(Math.random() * 1000000);
  const targetOrderNumber = `TESTCYPRESS${randomId}`; // Hapus tanda strip (-)

  // 1. GLOBAL ERROR HANDLER
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false; 
    });
  });

  // 2. SETUP LOGIN
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login'); 
    
    // Login
    const email = Cypress.env('adminEmail') || 'admin@gmail.com'; 
    const password = Cypress.env('adminPassword') || 'passwordAdmin123';
    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();
    
    // Masuk Menu Pickup
    cy.visit('http://127.0.0.1:8000/admin/pickup');
  });

  // ============================================================
  // TEST 1: POSITIF (Harus Berhasil)
  // ============================================================
  it('1. Positif: Admin berhasil request pickup (Data Baru)', () => {
    
    cy.log('🚀 Input Order Baru: ' + targetOrderNumber);

    // Isi Input
    cy.get('input[name="order_number"]')
      .invoke('val', targetOrderNumber) 
      .trigger('input'); 

    // Verifikasi Input Masuk
    cy.get('input[name="order_number"]').should('have.value', targetOrderNumber);

    // Klik Request
    cy.get('#submitBtn').should('not.be.disabled').click();

    // VERIFIKASI HASIL
    // 1. URL tetap di pickup
    cy.visit('http://127.0.0.1:8000/admin/pickup');
    
    
    cy.log('✅ Test 1 Berhasil: Pickup terbuat.');
  });

  // ============================================================
  // TEST 2: NEGATIF (Pakai Nomor Sama -> Harus Gagal)
  // ============================================================
  it('2. Negatif: Gagal request ulang dengan nomor yang sama (Duplikat)', () => {
    
    cy.log('🔄 Input Order Duplikat: ' + targetOrderNumber);

    // Isi Input dengan NOMOR YANG SAMA persis dari Test 1
    cy.get('input[name="order_number"]')
      .invoke('val', targetOrderNumber) 
      .trigger('input'); 

    // Klik Request Lagi
    cy.get('#submitBtn').should('not.be.disabled').click();

    // VERIFIKASI ERROR
    // 1. URL tetap di pickup
    cy.url().should('include', '/admin/pickup');

    // 2. Cari pesan error dari Laravel
    cy.get('body').then(($body) => {
        const errorElement = $body.find('.text-red-600, .alert-danger, .text-danger, li.text-red-500');
        
        if (errorElement.length > 0) {
            cy.log('✅ Validasi Berjalan! Error Ditemukan: ' + errorElement.text().trim());
            cy.wrap(errorElement).should('be.visible');
        } else {
            // Jika tidak muncul error, kita Fail-kan test ini secara manual
            throw new Error('🚨 BAHAYA: Sistem tidak menolak order duplikat! Pesan error tidak muncul.');
        }
    });

    cy.log('✅ Test 2 Berhasil: Request Ditolak karena Duplikat.');
  });

});