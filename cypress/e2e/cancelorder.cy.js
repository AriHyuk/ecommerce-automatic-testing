describe('Cancel Order Test', () => {

    beforeEach(() => {
        // LOGIN
        cy.visit('https://ptkundalinicahayamakmur.com/login');
        cy.get('#email').type('ariawl0209@gmail.com');
        cy.get('#password').type('AriHyuk123');
        cy.get('#login-btn').click();
        cy.url().should('include', 'ptkundalinicahayamakmur.com');
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
