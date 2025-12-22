describe('KCM001 - Pengujian Register', () => {
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/register'); 
  });

  it('Negatif: Gagal daftar jika kolom wajib kosong', () => {
    cy.url().should('include', '/register');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/register');
    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
    cy.log('✅ Skenario Negatif Berhasil: User tertahan di halaman register');
  });

  it('Positif: Berhasil registrasi dengan data valid', () => {
    const randomNum = Math.floor(Math.random() * 100000);
    const uniqueEmail = `testing${randomNum}@gmail.com`;
    const uniqueWA = `0812${randomNum}`;
    cy.get('input[name="name"]') 
      .type('User Testing Cypress');
    cy.get('input[name="email"]') 
      .type(uniqueEmail);
    cy.get('body').then(($body) => {
        if ($body.find('input[name="whatsapp"]').length > 0) {
            cy.get('input[name="whatsapp"]').type(uniqueWA);
        } else if ($body.find('input[name="phone"]').length > 0) {
            cy.get('input[name="phone"]').type(uniqueWA);
        }
    });
    cy.get('input[name="password"]')
      .type('Password123!');
    cy.get('body').then(($body) => {
        if ($body.find('input[name="password_confirmation"]').length > 0) {
            cy.get('input[name="password_confirmation"]').type('Password123!');
        }
    });
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/register');
    cy.log(`✅ Skenario Positif Berhasil: User terdaftar dengan email ${uniqueEmail}`);
  });
});