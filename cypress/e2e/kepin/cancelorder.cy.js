describe('Cancel Order Test', () => {

    beforeEach(() => {
        // LOGIN
        cy.visit('http://127.0.0.1:8000/login');
    // Login akun 'ariawl0209'
    const email = Cypress.env('userEmail') || 'user@gmail.com'; 
    const password = Cypress.env('userPassword') || 'user123';
    
    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
        cy.get('#login-btn').click();
        cy.url().should('include', '/');
    });

    it('Flow: Cancel Order dengan konfirmasi OK', () => {

        // 1. MENU PESANAN SAYA
        cy.contains(/pesanan saya|my account/i).click({ force: true });

        // 2. BUKA SEMUA PESANAN
        cy.contains(/semua pesanan|pesanan/i).click({ force: true });

        // 3. DETAIL PESANAN PERTAMA
        cy.contains(/detail/i).first().click({ force: true });

        // 4. SIAPKAN HANDLER CONFIRM
        cy.on('window:confirm', (msg) => {
            expect(msg).to.include('Yakin ingin membatalkan'); 
            return true; // tekan OK
        });

        // 5. KLIK TOMBOL BATALKAN
        cy.contains('Batalkan').click({ force: true });

        // 6. VALIDASI STATUS BERUBAH
        cy.contains(/cancelled|dibatalkan|canceled/i, { timeout: 10000 })
          .should('exist');

    });

});
