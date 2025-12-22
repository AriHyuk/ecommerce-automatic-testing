describe('Login Tests Sistem Kamu', () => {
    it(' Positif : Login dengan kredensial valid', () => {
        cy.visit('http://127.0.0.1:8000/login');
        const email = Cypress.env('userEmail') || 'user@gmail.com'; 
        const password = Cypress.env('userPassword') || 'passwordAdmin123';
        cy.get('input[name="email"]').type(email); 
        cy.get('input[name="password"]').type(password); 
        cy.get('#login-btn').click();
        cy.url().should('not.include', '/login');
        cy.visit('http://127.0.0.1:8000/');
    });
    it('Negatif : Login dengan password salah', () => {
        cy.visit('http://127.0.0.1:8000/login');
        cy.get('#email').type('ariaja@gmail.com ');
        cy.get('#password').type('hohoho');
        cy.get('#login-btn').click();
        cy.get('.text-red-600')
            .should('contain', 'These credentials do not match our records');
    });
});
