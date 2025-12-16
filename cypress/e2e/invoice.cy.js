describe('Flow Invoice Lengkap', () => {

    it('Login → Pesanan → Detail → Invoice → Cetak', () => {

        // LOGIN
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('ariawl0209@gmail.com');
        cy.get('#password').type('AriHyuk123');
        cy.get('#login-btn').click();

        // FIX: website kamu tidak redirect ke /dashboard
        cy.url().should('include', 'ptkundalinicahayamakmur.com');

        // BUKA MENU PESANAN SAYA
        cy.contains(/pesanan saya|my account/i, { timeout: 10000 })
          .click({ force: true });

        // LIHAT SEMUA PESANAN
        cy.contains(/semua pesanan|lihat semua/i)
          .click({ force: true });

        // DETAIL PESANAN
        cy.contains(/detail/i)
          .first()
          .click({ force: true });

        // MASUK HALAMAN INVOICE
        cy.contains(/invoice/i).click({ force: true });

        // STUB PRINT
        cy.window().then(win => {
            cy.stub(win, 'print').as('printCalled');
        });

        // KLIK CETAK INVOICE
        cy.contains(/cetak invoice/i).click({ force: true });

        // VALIDASI PRINT
        cy.get('@printCalled').should('have.been.called');

    });
});
