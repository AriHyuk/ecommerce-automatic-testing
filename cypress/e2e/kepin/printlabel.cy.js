describe('Print Label (Cetak Invoice)', () => {

    beforeEach(() => {
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('ariawl0209@gmail.com');
        cy.get('#password').type('AriHyuk123');
        cy.get('#login-btn').click();
        cy.url().should('include', 'ptkundalinicahayamakmur.com');
    });

    it('Flow Print Label dari Detail Pesanan', () => {

        // Buka Pesanan Saya / My Account
        cy.contains(/pesanan saya|my account/i).click({ force: true });

        // Lihat semua pesanan
        cy.contains(/semua pesanan|lihat semua/i).click({ force: true });

        // Detail pesanan pertama
        cy.contains(/detail/i).first().click({ force: true });

        // Masuk ke invoice
        cy.contains(/invoice/i).click({ force: true });

        // Stub window.print()
        cy.window().then(win => {
            cy.stub(win, 'print').as('printLabel');
        });

        // CETAK = PRINT LABEL
        cy.contains(/cetak invoice/i).click({ force: true });

        // Validasi bahwa print dipanggil
        cy.get('@printLabel').should('have.been.called');
    });

});
