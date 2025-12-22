describe('KCM004 - Pickup Flow (Success then Duplicate)', () => {
  const randomId = Math.floor(Math.random() * 1000000);
  const targetOrderNumber = `TESTCYPRESS${randomId}`; 

  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false; 
    });
  });
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login'); 
    const email = Cypress.env('adminEmail') || 'admin@gmail.com'; 
    const password = Cypress.env('adminPassword') || 'passwordAdmin123';
    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();
    
    // Masuk Menu Pickup
    cy.visit('http://127.0.0.1:8000/admin/pickup');
  });

  it('1. Positif: Admin berhasil request pickup (Data Baru)', () => {
    cy.log('🚀 Input Order Baru: ' + targetOrderNumber);
    cy.get('input[name="order_number"]')
      .invoke('val', targetOrderNumber) 
      .trigger('input'); 
    cy.get('input[name="order_number"]').should('have.value', targetOrderNumber);
    cy.get('#submitBtn').should('not.be.disabled').click();
    cy.visit('http://127.0.0.1:8000/admin/pickup');
    cy.log('✅ Test 1 Berhasil: Pickup terbuat.');
  });

  it('2. Negatif: Gagal request ulang dengan nomor yang sama (Duplikat)', () => {
    cy.log('🔄 Input Order Duplikat: ' + targetOrderNumber);
    cy.get('input[name="order_number"]')
      .invoke('val', targetOrderNumber) 
      .trigger('input'); 
    cy.get('#submitBtn').should('not.be.disabled').click();
    cy.url().should('include', '/admin/pickup');
    cy.get('body').then(($body) => {
        const errorElement = $body.find('.text-red-600, .alert-danger, .text-danger, li.text-red-500');
        if (errorElement.length > 0) {
            cy.log('✅ Validasi Berjalan! Error Ditemukan: ' + errorElement.text().trim());
            cy.wrap(errorElement).should('be.visible');
        } else {
            throw new Error('🚨 BAHAYA: Sistem tidak menolak order duplikat! Pesan error tidak muncul.');
        }
    });
    cy.log('✅ Test 2 Berhasil: Request Ditolak karena Duplikat.');
  });
});