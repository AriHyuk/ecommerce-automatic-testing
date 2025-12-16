describe('Tracking pesanan - pilih detail paling bawah', () => {

    it('Klik tombol Lihat Detail terakhir (paling lama)', () => {

        // === LOGIN ===
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('ariawl0209@gmail.com');
        cy.get('#password').type('AriHyuk123');
        cy.get('#login-btn').click();

        // === MY ACCOUNT ===
        cy.contains('My Account', { timeout: 10000 }).click();

        // === PESANAN SAYA ===
        cy.contains('Pesanan Saya', { timeout: 10000 }).click();
        cy.url().should('include', '/user/orders');


        // === SCROLL KE BAWAH DULU ===
        cy.scrollTo('bottom', { duration: 700 });


        // === AMBIL SEMUA TOMBOL LIHAT DETAIL ===
        cy.get('a')
          .filter(':contains("Lihat Detail")')   // ambil tombol Lihat Detail
          .then(($buttons) => {

              const lastButton = $buttons[$buttons.length - 1]; // ambil yang terakhir

              cy.wrap(lastButton)
                  .scrollIntoView()
                  .click({ force: true }); // klik tombol paling bawah

          });


        // === VALIDASI MASUK KE HALAMAN DETAIL ===
        cy.url().should('include', '/user/orders/');


        // === KLIK LACAK PAKET ===
        cy.contains('Lacak Paket', { timeout: 10000 })
            .scrollIntoView()
            .click();


        // === VALIDASI HALAMAN TRACKING ===
        cy.url().should('include', '/tracking');

    });

});
