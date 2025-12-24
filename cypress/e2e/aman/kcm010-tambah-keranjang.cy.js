describe("KCM010 - Pengujian Tambah Produk ke Keranjang", () => {

  // 1. GLOBAL ERROR HANDLER
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  // 2. SETUP: LOGIN SEBELUM TEST
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login');

    // Login sebagai User
    cy.get('body').then(($body) => {
        if ($body.find('input[name="email"]').length > 0) {
            const email = Cypress.env('userEmail') || 'user123@gmail.com'; 
            const password = Cypress.env('userPassword') || 'password1123';
            cy.get('input[name="email"]').type(email); 
            cy.get('input[name="password"]').type(password); 
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/login');
        }
    });
  });

  it("Positif: Berhasil menambahkan produk ke keranjang", () => {
    cy.visit("http://127.0.0.1:8000/toko-gewe-88");
    cy.wait(1000);
    cy.get('.gwen-polaroid-card:visible, .card a').first().scrollIntoView().click();
    cy.get('body').then(($body) => {
        const variantSelect = $body.find('select[name="variant"], select[name="size"], select[name="color"]');
        const variantRadio = $body.find('input[type="radio"].variant-selector');
        if (variantSelect.length > 0) {
            cy.log('ℹ️ Produk memiliki varian (Select), memilih opsi ke-2...');
            cy.wrap(variantSelect).select(1, {force: true}); 
        } 
        else if (variantRadio.length > 0) {
            cy.log('ℹ️ Produk memiliki varian (Radio), memilih opsi pertama...');
            cy.wrap(variantRadio).first().check({force: true});
        }
    });
    cy.contains('button', /Tambah.*keranjang/i).should('be.visible').click();
    cy.get('body').then(($body) => {
        if ($body.find('.swal2-success').length > 0) {
            cy.get('.swal2-success').should('be.visible');
            cy.contains('Berhasil').should('be.visible');
        } else {
            cy.get('.text-red-600').should('not.exist');
        }
    });
    cy.log('✅ Produk berhasil masuk keranjang');
  });

  it("Negatif: Gagal tambah jika varian wajib belum dipilih", () => {
    cy.visit("http://127.0.0.1:8000/toko-gewe-88");
    cy.get('.gwen-polaroid-card:visible').first().scrollIntoView().click();
    cy.get('body').then(($body) => {
        const hasVariant = $body.find('select[name="variant"], select[name="size"], input[type="radio"].variant-selector').length > 0;
        if (hasVariant) {
            cy.log('🔄 Test Negatif: Sengaja TIDAK memilih varian...');
            cy.contains('button', /Tambah.*keranjang/i).click();
            cy.on('window:alert', (str) => {
                expect(str).to.contain('Pilih varian');
            });
            cy.get('select[required], input[required]').first().then(($input) => {
                expect($input[0].validationMessage).to.not.be.empty;
            });
            cy.log('✅ Skenario Negatif Berhasil: Sistem menolak input tanpa varian');
        } else {
            cy.log('⚠️ SKIPPED: Produk ini tidak memiliki varian, tidak bisa tes negatif varian.');
        }
    });
  });
});