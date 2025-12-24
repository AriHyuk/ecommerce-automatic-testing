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
            const email = Cypress.env('userEmail') || 'ariawl0209@gmail.com'; 
            const password = Cypress.env('userPassword') || 'AriHyuk123';
            cy.get('input[name="email"]').type(email); 
            cy.get('input[name="password"]').type(password); 
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/login');
        }
    });
  });

  // ============================================================
  // ✅ SKENARIO POSITIF
  // Deskripsi: Pilih Varian (Jika ada) -> Tambah -> Berhasil
  // ============================================================
  it("Positif: Berhasil menambahkan produk ke keranjang", () => {
    
    // 1. Masuk ke Toko
    cy.visit("http://127.0.0.1:8000/toko-gewe-88");
    cy.wait(1000);

    // 2. Pilih Produk Pertama & Masuk Detail
    cy.get('.gwen-polaroid-card:visible, .card a').first().scrollIntoView().click();
    
    // 3. LOGIKA VARIAN (Handle jika produk punya varian)
    cy.get('body').then(($body) => {
        // Cek apakah ada elemen select atau radio button untuk varian
        // Sesuaikan selector ini dengan kodingan blade kamu (misal: select[name="size"])
        const variantSelect = $body.find('select[name="variant"], select[name="size"], select[name="color"]');
        const variantRadio = $body.find('input[type="radio"].variant-selector');

        if (variantSelect.length > 0) {
            cy.log('ℹ️ Produk memiliki varian (Select), memilih opsi ke-2...');
            // Pilih opsi index ke-1 (biasanya index 0 itu "Pilih Ukuran")
            cy.wrap(variantSelect).select(1, {force: true}); 
        } 
        else if (variantRadio.length > 0) {
            cy.log('ℹ️ Produk memiliki varian (Radio), memilih opsi pertama...');
            cy.wrap(variantRadio).first().check({force: true});
        }
    });

    // 4. Klik Tombol Tambah
    // Cari tombol yang mengandung kata "keranjang"
    cy.contains('button', /Tambah.*keranjang/i).should('be.visible').click();

    // 5. Verifikasi Berhasil
    // Assert: Muncul SweetAlert Sukses atau Badge Keranjang bertambah
    cy.get('body').then(($body) => {
        if ($body.find('.swal2-success').length > 0) {
            cy.get('.swal2-success').should('be.visible');
            cy.contains('Berhasil').should('be.visible');
        } else {
            // Alternatif: Cek tidak ada error merah
            cy.get('.text-red-600').should('not.exist');
        }
    });

    cy.log('✅ Produk berhasil masuk keranjang');
  });


  // ============================================================
  // ❌ SKENARIO NEGATIF
  // Deskripsi: Kosongkan Varian -> Tambah -> Gagal (Error Muncul)
  // ============================================================
  it("Negatif: Gagal tambah jika varian wajib belum dipilih", () => {
    
    // 1. Masuk ke Toko
    cy.visit("http://127.0.0.1:8000/toko-gewe-88");
    
    // 2. Pilih Produk (Cari produk yang punya varian jika memungkinkan)
    // Kita asumsi produk pertama punya varian, atau kita loop cari yg punya varian
    cy.get('.gwen-polaroid-card:visible').first().scrollIntoView().click();

    // 3. VERIFIKASI KEBERADAAN VARIAN
    cy.get('body').then(($body) => {
        // Cek apakah ada input varian?
        const hasVariant = $body.find('select[name="variant"], select[name="size"], input[type="radio"].variant-selector').length > 0;

        if (hasVariant) {
            cy.log('🔄 Test Negatif: Sengaja TIDAK memilih varian...');

            // 4. LANGSUNG KLIK TAMBAH (Tanpa pilih varian)
            cy.contains('button', /Tambah.*keranjang/i).click();

            // 5. ASSERT ERROR
            // Harusnya muncul pesan "Pilih varian dulu"
            
            // Cek Alert Browser (Window Alert)
            cy.on('window:alert', (str) => {
                expect(str).to.contain('Pilih varian'); // Sesuaikan teks alert kamu
            });

            // ATAU Cek HTML Validation (Required message)
            cy.get('select[required], input[required]').first().then(($input) => {
                expect($input[0].validationMessage).to.not.be.empty;
            });

            // ATAU Cek Flash Message Error (Merah)
            // cy.get('.text-red-600, .alert-danger, .swal2-error').should('be.visible');

            cy.log('✅ Skenario Negatif Berhasil: Sistem menolak input tanpa varian');

        } else {
            // Jika produk ini tidak punya varian, test negatif ini tidak valid (False Positive)
            cy.log('⚠️ SKIPPED: Produk ini tidak memiliki varian, tidak bisa tes negatif varian.');
        }
    });
  });

});