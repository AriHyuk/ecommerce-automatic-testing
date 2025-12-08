describe('Saus Demo - Detail Produk', () => {
    it('Melihat detail produk berhasil', () => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('#user-name').type('standard_user');
        cy.get('#password').type('secret_sauce');
        cy.get('#login-button').click();
        cy.get('#item_4_title_link').click();
        cy.get('.inventory_details_name').should('contain', 'Sauce Labs Backpack');
    });
});
