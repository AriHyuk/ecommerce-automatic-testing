describe('Checkout Flow Toko Gewe (Final Fix)', () => {

  // 1. GLOBAL ERROR HANDLER (WAJIB)
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // Abaikan error map & script pihak ketiga
      return false;
    });
  });

  it('Flow Real: Login -> Beli -> Checkout', () => {
    cy.viewport(1280, 720);

    // ============================================================
    // A. LOGIN & MASUK TOKO
    // ============================================================
    cy.visit('http://127.0.0.1:8000/');

    cy.get('body').then(($body) => {
        if ($body.find('a:contains("Login")').length > 0) {
            cy.contains('a', 'Login').click();
            cy.get('#email').type('ariawl0209@gmail.com');
            cy.get('#password').type('AriHyuk123');
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/login');
            cy.visit('http://127.0.0.1:8000/');
        }
    });

    cy.contains('footer a', 'Toko Gewe 88').scrollIntoView().click({ force: true });

    // Handle Tab
    cy.get('#all-tab').should('exist').then(($tab) => {
      if (!$tab.hasClass('active')) cy.wrap($tab).click();
    });

    // Pilih Produk
    cy.get('.gwen-polaroid-card:visible', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.gwen-polaroid-card:visible').first().scrollIntoView().click();

    // Beli Sekarang
    cy.get('#buy-now-button').should('be.visible').click();
    cy.url({ timeout: 15000 }).should('include', '/checkout');

    // ============================================================
    // B. ISI FORM & HANDLING KOTA (CRITICAL PART)
    // ============================================================
    cy.get('#name').clear().type('Ari Awaludin');
    cy.get('#whatsapp').clear().type('085893707918');
    cy.get('#address').type('Kp. Bojong Ranji RT.02/Rw.02 No.78');

    // --- PENCARIAN KOTA ---
    cy.get('#destinationSearch').type('BUARAN');
    
    // Tunggu hasil muncul & Klik
    cy.get('.destination-item', { timeout: 15000 }).should('be.visible').first().click();

    // 🔥 FIX UTAMA: TUNGGU SAMPAI ID KOTA TERISI 🔥
    // Cypress akan pause disini sampai hidden input terisi oleh script website.
    // Jika ini kosong, backend pasti menolak (reload page).
    cy.get('#receiverDestinationId', { timeout: 10000 })
      .should('not.have.value', ''); 

    // ============================================================
    // C. HANDLE MAP & ONGKIR
    // ============================================================
    
    // Safety wait untuk map
    cy.wait(2000);

    // Force Fill Pinpoint (Koordinat Saja)
    cy.get('#destinationPinPoint').then(($input) => {
        if (!$input.val()) {
            cy.log('⚠️ Mengisi Pinpoint Manual...');
            cy.wrap($input).invoke('val', '-6.330153,106.665584').trigger('change');
        }
    });

    // Pancing Request Ongkir (Toggle Radio)
    cy.get('input[name="shipping_type"][value="instant"]').check({ force: true });
    cy.wait(1000);
    cy.get('input[name="shipping_type"][value="reguler"]').check({ force: true });

    // ============================================================
    // D. PILIH KURIR & BAYAR
    // ============================================================

    // Tunggu opsi kurir muncul
    cy.get('.shipping-service-option', { timeout: 20000 }).should('have.length.at.least', 1);
    
    // Klik opsi pertama
    cy.get('.shipping-service-option').first().click();

    // Validasi Hidden Input Ongkir Terisi
    cy.get('#shipping_cost').then(($input) => {
        const ongkir = parseInt($input.val());
        expect(ongkir).to.be.greaterThan(0); 
    });

    // Pilih Bank Transfer
    cy.get('input[name="payment_method"][value="BANK TRANSFER"]').check({ force: true });

    // KLIK CHECKOUT
    cy.get('#checkoutBtn').should('not.be.disabled').click();

    // ============================================================
    // E. FINAL ASSERTION & DEBUGGER
    // ============================================================
    
    // Cek apakah ada error merah di layar jika URL masih di checkout
    cy.document().then((doc) => {
        setTimeout(() => {
            if (doc.location.href.includes('/checkout')) {
                 const errorMsg = doc.querySelector('.text-red-600, .alert-danger')?.innerText;
                 if (errorMsg) cy.log("🚨 ERROR DARI SERVER: " + errorMsg);
            }
        }, 3000);
    });

    // Assert Pindah Halaman
    cy.url({ timeout: 40000 }).should('not.include', '/checkout');
    cy.log('✅ Checkout Berhasil Disubmit!');
  });
});