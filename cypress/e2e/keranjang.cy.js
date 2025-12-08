describe('Saus Demo - Add to Cart', () => {
    it('Tambah produk ke keranjang', () => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('#user-name').type('standard_user');
        cy.get('#password').type('secret_sauce');
        cy.get('#login-button').click();
        cy.get('#add-to-cart-sauce-labs-backpack').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('.inventory_item_name').should('contain', 'Sauce Labs Backpack');
    });
});
