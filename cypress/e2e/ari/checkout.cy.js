describe('KCM003 - Pengujian Checkout (Positif & Negatif)', () => {
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/');
    cy.get('body').then(($body) => {
        if ($body.find('a:contains("Login")').length > 0) {
            cy.contains('a', 'Login').click();
            const email = Cypress.env('userEmail') || 'user@gmail.com'; 
            const password = Cypress.env('userPassword') || 'passdowrdAdmin123';
            
            cy.get('input[name="email"]').type(email); 
            cy.get('input[name="password"]').type(password); 
            cy.get('button[type="submit"]').click();
            
            cy.url().should('not.include', '/login');
            cy.visit('http://127.0.0.1:8000/');
        }
    });
    cy.contains('footer a', 'Toko Gewe 88').scrollIntoView().click({ force: true });
    cy.get('#all-tab').should('exist').then(($tab) => {
      if (!$tab.hasClass('active')) cy.wrap($tab).click();
    });
    cy.get('.gwen-polaroid-card:visible', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.gwen-polaroid-card:visible').first().scrollIntoView().click();
    cy.get('#buy-now-button').should('be.visible').click();
    cy.url({ timeout: 50000 }).should('include', '/checkout');
  });
  it('Positif: Berhasil Checkout dengan data lengkap', () => {
    cy.get('#name').clear().type('Ari Awaludin');
    cy.get('#whatsapp').clear().type('085893707918');
    cy.get('#address').type('Kp. Bojong Ranji RT.02/Rw.02 No.78');
    cy.get('#destinationSearch').type('BUARAN');
    cy.get('.destination-item', { timeout: 15000 }).should('be.visible').first().click();
    cy.get('#receiverDestinationId', { timeout: 10000 }).should('not.have.value', ''); 
    cy.wait(6000);
    cy.get('#destinationPinPoint').then(($input) => {
        if (!$input.val()) {
            cy.log('⚠️ Mengisi Pinpoint Manual...');
            cy.wrap($input).invoke('val', '-6.330153,106.665584').trigger('change');
        }
    });
    cy.get('input[name="shipping_type"][value="instant"]').check({ force: true });
    cy.wait(5000);
    cy.get('input[name="shipping_type"][value="reguler"]').check({ force: true });
    
    cy.get('.shipping-service-option', { timeout: 60000 }).should('have.length.at.least', 1);
    cy.get('.shipping-service-option').first().click();
    cy.get('#shipping_cost').then(($input) => {
        const ongkir = parseInt($input.val());
        expect(ongkir).to.be.greaterThan(0); 
    });
    cy.get('input[name="payment_method"][value="BANK TRANSFER"]').check({ force: true });
    cy.get('#checkoutBtn').should('not.be.disabled').click();
    cy.log('✅ Checkout Berhasil Disubmit');
  });

  it('Negatif: Gagal Checkout jika Alamat/Kota dikosongkan', () => {
    cy.get('#name').clear().type('User Testing Error');
    cy.get('#whatsapp').clear().type('08123456789');
    cy.get('#address').clear();
    cy.get('#destinationSearch').clear();
    cy.get('#checkoutBtn').click();
    cy.url().should('include', '/checkout');
    cy.get('#address').then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
        expect($input[0].validationMessage).to.not.be.empty;
    });
    cy.log('✅ Skenario Negatif Berhasil: Checkout tertahan karena data tidak lengkap');
  });
});