describe('KCM006 - Tambah Kategori Produk', () => {

    beforeEach(() => {
        // Mock login admin
        cy.visit('/login');
        cy.get("#email").type(Cypress.env("adminEmail"));
        cy.get("#password").type(Cypress.env("adminPassword"));
        cy.get('#login-btn').click();

        cy.url().should('not.include', '/login');
    });

    it('Positif - admin berhasil menambahkan kategori baru', () => {
        cy.intercept('POST', '/admin/categories', {
            statusCode: 201,
            body: { id: 999, name: 'Kategori Test Cypress' }
        }).as('postCategory');

        cy.visit('/admin/categories/create');
        cy.get('input[name="name"]').type('Kategori Test Cypress');

        cy.contains('button', 'Simpan').click();

        cy.wait('@postCategory').its('response.statusCode').should('eq', 201);
    });

    it('Negatif - admin gagal menambahkan kategori kosong', () => {
        cy.intercept('POST', '/admin/categories', {
            statusCode: 422,
            body: { errors: { name: ['The name field is required.'] } }
        }).as('postCategoryFail');

        cy.visit('/admin/categories/create');

        // Remove attribute required agar form bisa submit
        cy.get('input[name="name"]').invoke('removeAttr', 'required').clear();

        cy.contains('button', 'Simpan').click();

        cy.wait('@postCategoryFail').its('response.statusCode').should('eq', 422);
    });

    it('Negatif - admin gagal menambahkan kategori duplikat', () => {
        cy.intercept('POST', '/admin/categories', {
            statusCode: 409,
            body: { message: 'Kategori sudah ada' }
        }).as('postCategoryFailDuplicate');

        cy.visit('/admin/categories/create');
        cy.get('input[name="name"]').type('Kategori Test Cypress');

        cy.contains('button', 'Simpan').click();

        cy.wait('@postCategoryFailDuplicate').its('response.statusCode').should('eq', 409);
    });

});
