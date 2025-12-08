describe('Saus Demo - Checkout Produk', () => {
    it('Checkout produk berhasil', () => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('#user-name').type('standard_user');
        cy.get('#password').type('secret_sauce');
        cy.get('#login-button').click();
        cy.get('#add-to-cart-sauce-labs-backpack').click();
        cy.get('.shopping_cart_link').click();
        cy.get('[data-test="checkout"]').click();
        cy.get('#first-name').type('John');
        cy.get('#last-name').type('Doe');
        cy.get('#postal-code').type('12345');
        cy.get('#continue').click();
        cy.get('#finish').click();
        cy.get('[data-test="complete-header"]').should('contain', 'Thank you for your order!');
    });
});
