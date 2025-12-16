describe('Login Tests Sistem Kamu', () => {

    it('Login dengan kredensial valid', () => {
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('ariawl0209@gmail.com');
        cy.get('#password').type('AriHyuk123');
        cy.get('#login-btn').click();

        // login berhasil → harus pindah halaman
        cy.url().should('not.include', '/login');

        // indikator sudah login (pilih salah satu yang ada di aplikasimu)
        cy.visit('http://127.00.1:8000/');
    });

    it('Login dengan password salah', () => {
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('admin@gmail.com');
        cy.get('#password').type('salah_banget');
        cy.get('#login-btn').click();

        // pesan error dari Laravel Breeze / Fortify
        cy.get('.text-red-600')
            .should('contain', 'These credentials do not match our records');
    });

    it('Menguji warna tombol login', () => {
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#login-btn')
            .should('have.css', 'background-image')
            .and('contain', 'linear-gradient'); // button kamu pakai gradient
    });

});
