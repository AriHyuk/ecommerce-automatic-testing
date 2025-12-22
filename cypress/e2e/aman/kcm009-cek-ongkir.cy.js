describe('KCM009 - Pengujian Cek Ongkir (Shipping Cost Calculation)', () => {

  // 1. GLOBAL ERROR HANDLER (Wajib ada biar ga putus di tengah jalan)
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  // 2. SETUP: LOGIN & MASUK CHECKOUT
  // Kita taruh proses login di beforeEach biar clean
  beforeEach(() => {
    cy.viewport(1280, 720);
    
    // --- LOGIN FLOW ---
    cy.visit('http://127.0.0.1:8000/login'); // Ganti URL jika live

    cy.get('body').then(($body) => {
        // Cek apakah butuh login (jika ada tombol login)
        if ($body.find('input[name="email"]').length > 0) {
            const email = Cypress.env('userEmail') || 'ariawl0209@gmail.com'; 
            const password = Cypress.env('userPassword') || 'AriHyuk123';

            cy.get('input[name="email"]').type(email);
            cy.get('input[name="password"]').type(password);
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/login');
        }
    });

    // --- MASUK KE HALAMAN CHECKOUT ---
    // Kita bypass flow klik-klik produk biar cepat, langsung visit URL toko -> produk -> checkout
    cy.visit('http://127.0.0.1:8000/toko-gewe-88'); // Sesuaikan URL Toko
    
    // Klik Produk Pertama
    cy.get('.gwen-polaroid-card', { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click();

    // Klik Beli Sekarang
    cy.get('#buy-now-button').should('be.visible').click();
    
    // Assert sudah di halaman checkout
    cy.url({ timeout: 15000 }).should('include', '/checkout');
  });

  // ============================================================
  // SKENARIO POSITIF
  // ============================================================
  it('✅ POSITIF: Pengguna berhasil mengecek ongkos kirim (Valid Data)', () => {
    
    // 1. Isi Data Wajib (Supaya tidak ada error lain)
    cy.get('#name').clear().type('Tester Ongkir');
    cy.get('#whatsapp').clear().type('08123456789');
    cy.get('#address').type('Jalan Pengujian No. 1');

    // 2. Masukkan Kota Tujuan (Valid)
    cy.get('#destinationSearch').type('BUARAN');
    
    // Tunggu hasil & Klik
    cy.get('.destination-item', { timeout: 10000 }).should('be.visible').first().click();

    // 3. HANDLE MAP & PINPOINT (Logic Kunci agar Ongkir Jalan)
    cy.wait(2000); // Tunggu script map loading

    // Guard: Pastikan Pinpoint terisi
    cy.get('#destinationPinPoint').then(($input) => {
        if (!$input.val()) {
            cy.log('⚠️ Force fill pinpoint...');
            cy.wrap($input).invoke('val', '-6.330153,106.665584').trigger('change');
            // Biarkan ID kota diisi otomatis oleh script website
        }
    });

    // 4. PILIH EKSPEDISI (Trigger Cek Ongkir)
    // Trik Toggle: Klik Instant dulu -> Lalu Reguler (Memancing request API)
    cy.get('input[name="shipping_type"][value="instant"]').check({ force: true });
    cy.wait(1000);
    cy.get('input[name="shipping_type"][value="reguler"]').check({ force: true });

    // 5. VERIFIKASI HASIL
    // Pastikan list layanan muncul
    cy.get('.shipping-service-option', { timeout: 15000 }).should('have.length.at.least', 1);
    
    // Pilih layanan pertama
    cy.get('.shipping-service-option').first().click();

    // Assert Biaya Tampil (Bukan Rp 0)
    cy.get('#shippingCostDisplay').should('not.contain', 'Rp 0');
    
    // Validasi value input hidden
    cy.get('#shipping_cost').then(($input) => {
        const cost = parseInt($input.val());
        expect(cost).to.be.greaterThan(0);
        cy.log(`✅ Ongkir Berhasil Dihitung: Rp ${cost}`);
    });
  });

  // ============================================================
  // SKENARIO NEGATIF
  // ============================================================
  it('❌ NEGATIF: Gagal cek ongkir jika kota kosong / tidak valid', () => {
    
    // 1. KASUS A: Kota Kosong
    cy.get('#destinationSearch').clear();
    
    // Coba pilih ekspedisi tanpa isi kota
    cy.get('input[name="shipping_type"][value="reguler"]').check({ force: true });

    // Assert: Tidak ada layanan muncul
    cy.get('.shipping-service-option').should('not.exist');
    
    // Assert: Pesan Peringatan Muncul (Sesuai UI kamu: "Pilih kota/kecamatan...")
    cy.get('#shippingServices').should('contain', 'Pilih kota');
    cy.get('#shippingCostDisplay').should('contain', 'Rp 0');
    cy.log('✅ Sistem menolak kalkulasi jika kota kosong');

    // 2. KASUS B: Kota Tidak Terdaftar / Ngasal
    cy.get('#destinationSearch').type('KOTA_GAIB_12345');
    
    // Tunggu sebentar
    cy.wait(2000);

    // Assert: Dropdown hasil pencarian bilang "Tidak ada hasil"
    // Sesuaikan selector/text dengan behaviour UI kamu saat not found
    cy.get('#destinationResults')
      .should('be.visible')
      .and('contain', 'Tidak ada hasil'); // Atau text lain yang muncul

    cy.log('✅ Sistem memberi info jika kota tidak ditemukan');
  });

});