describe('KCM008 - Pengujian Booking User (Positif & Negatif)', () => {

    //
    // ──────────────────────────────────────────────
    //               TEST CASE POSITIF
    // ──────────────────────────────────────────────
    //
    it('KCM008-POSITIF: User berhasil memilih unit dan membooking properti', () => {

        // 1. Login sebagai user
        cy.userLogin();

        // 2. Masuk halaman gwen-property
        cy.visit('/gwen-property');

        // Pastikan card unit muncul
        cy.get('.gwen-polaroid-card')
            .should('exist')
            .first()
            .click({ force: true }); // buka modal

        // 3. Modal muncul → klik Lihat Detail
        cy.contains('Lihat Detail')
            .should('be.visible')
            .click({ force: true });

        // 4. Pastikan sudah masuk halaman detail unit
        cy.url().should('include', '/gwen-property/unit');

        // Klik tombol SEWA SEKARANG
        cy.contains('SEWA SEKARANG')
            .should('be.visible')
            .click({ force: true });

        // 5. Isi form booking
        cy.url().should('include', '/rent');

        cy.get('#full_name').clear().type('User Testing');
        cy.get('#whatsapp').clear().type('6281234567890');

        // Pilih unit pertama (yg available)
        cy.get('#rental_unit_id')
            .select(1); // bukan "-- pilih --"

        // Tanggal mulai hari ini
        const today = new Date().toISOString().split('T')[0];
        cy.get('#start_date').type(today);

        // Durasi sewa
        cy.get('#duration').clear().type(2);

        // 6. Submit form booking
        cy.contains('Ajukan Penyewaan')
            .click({ force: true });
        

        

    });



    //
    // ──────────────────────────────────────────────
    //               TEST CASE NEGATIF
    // ──────────────────────────────────────────────
    //
    it('KCM008-NEGATIF: User gagal membooking karena unit tidak dipilih / tidak tersedia', () => {

        // 1. Login user
        cy.userLogin();

        // 2. Masuk halaman gwen-property
        cy.visit('/gwen-property');

        // Buka modal unit
        cy.get('.gwen-polaroid-card')
            .should('exist')
            .first()
            .click({ force: true });

        // Masuk ke detail
        cy.contains('Lihat Detail')
            .should('be.visible')
            .click({ force: true });

        // Halaman unit
        cy.url().should('include', '/gwen-property/unit');

        // Klik sewa sekarang
        cy.contains('SEWA SEKARANG')
            .should('be.visible')
            .click({ force: true });

        // 3. TEST NEGATIF → Tidak memilih unit
        cy.get('#rental_unit_id').select(""); // pilih kosong

        // Isi data lain
        const today = new Date().toISOString().split('T')[0];
        cy.get('#start_date').type(today);
        cy.get('#full_name').clear().type('User Error Test');
        cy.get('#whatsapp').clear().type('6281234567890');
        cy.get('#start_date').type(today);
        cy.get('#duration').clear().type(2);

        // 4. Submit form
        cy.contains('Ajukan Penyewaan').click({ force: true });

        // 5. Validasi pesan error
        cy.contains(/unit|tidak tersedia|tidak dapat dipesan|wajib/i)
            .should('exist');
    });

});
