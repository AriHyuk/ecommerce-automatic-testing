describe('KCM008 - Pengujian Booking User (Positif & Negatif)', () => {

    it('KCM008-POSITIF: User berhasil memilih unit dan membooking properti', () => {
        cy.userLogin();
        cy.visit('/gwen-property');
        cy.get('.gwen-polaroid-card')
            .should('exist')
            .first()
            .click({ force: true });
        cy.contains('Lihat Detail')
            .should('be.visible')
            .click({ force: true });
        cy.url().should('include', '/gwen-property/unit');
        cy.contains('SEWA SEKARANG')
            .should('be.visible')
            .click({ force: true });
        cy.url().should('include', '/rent');
        cy.get('#full_name').clear().type('User Testing');
        cy.get('#whatsapp').clear().type('6281234567890');
        cy.get('#rental_unit_id')
            .select(1); 
        const today = new Date().toISOString().split('T')[0];
        cy.get('#start_date').type(today);
        cy.get('#duration').clear().type(2);
        cy.contains('Ajukan Penyewaan')
            .click({ force: true });
    });

    it('KCM008-NEGATIF: User gagal membooking karena unit tidak dipilih / tidak tersedia', () => {
        cy.userLogin();
        cy.visit('/gwen-property');
        cy.get('.gwen-polaroid-card')
            .should('exist')
            .first()
            .click({ force: true });
        cy.contains('Lihat Detail')
            .should('be.visible')
            .click({ force: true });
        cy.url().should('include', '/gwen-property/unit');
        cy.contains('SEWA SEKARANG')
            .should('be.visible')
            .click({ force: true });
        cy.get('#rental_unit_id').select("");
        const today = new Date().toISOString().split('T')[0];
        cy.get('#start_date').type(today);
        cy.get('#full_name').clear().type('User Error Test');
        cy.get('#whatsapp').clear().type('6281234567890');
        cy.get('#start_date').type(today);
        cy.get('#duration').clear().type(2);
        cy.contains('Ajukan Penyewaan').click({ force: true });
        cy.contains(/unit|tidak tersedia|tidak dapat dipesan|wajib/i)
            .should('exist');
    });
});
