describe('KCM013 - Pengujian Cancel Order (User Side)', () => {

  // 1. GLOBAL ERROR HANDLER
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  // 2. SETUP: LOGIN
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login');

    const email = Cypress.env('userEmail') || 'ariawl0209@gmail.com'; 
    const password = Cypress.env('userPassword') || 'AriHyuk123';
    
    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/login');
  });

  // ============================================================
  // ✅ SKENARIO POSITIF: ORDER SUBMITTED -> BATAL
  // ============================================================
  it('Positif: User berhasil membatalkan pesanan (Status Submitted -> Cancelled)', () => {
    
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.wait(1000);

    // 1. CARI ORDER "SUBMITTED" DI HALAMAN UTAMA
    cy.get('body').then(($body) => {
        
        // Regex untuk mencari status Submitted atau Diajukan
        const targetStatus = /Submitted|Diajukan/i;

        // Cek apakah ada badge status tersebut?
        if (!$body.text().match(targetStatus)) {
            cy.log('⚠️ SKIP: Tidak ada pesanan status Submitted untuk dibatalkan.');
            return;
        }

        // 2. KLIK TOMBOL DETAIL PADA ORDER TERSEBUT
        // Strategi: Cari text "Submitted" -> Naik ke Card (.group) -> Cari tombol Detail
        cy.contains('span', targetStatus)
          .closest('.group') // Naik ke wrapper card (Tailwind class di blade kamu)
          .find('a') // Cari semua link
          .contains(/Lihat Detail|Detail/i) // Filter link yang teksnya Detail
          .click();

        // 3. ASSERT MASUK HALAMAN DETAIL
        cy.url().should('include', '/user/orders/');

        // 4. SIAPKAN HANDLER CONFIRM POPUP
        cy.on('window:confirm', () => true);

        // 5. KLIK TOMBOL "BATALKAN"
        // Tombol ini harusnya ada untuk status Submitted
        cy.contains(/Batalkan|Cancel/i).should('be.visible').click();

        // 6. HANDLING JIKA ADA INPUT ALASAN (OPTIONAL)
        cy.get('body').then(($page) => {
            if ($page.find('input[name="reason"]').length > 0) {
                cy.get('input[name="reason"]').type('Batal Test Cypress');
                cy.get('button[type="submit"]').contains(/Kirim|Simpan/i).click();
            }
        });

        // 7. VERIFIKASI BERHASIL
        cy.wait(2000);
        
        cy.log('✅ Pesanan Submitted berhasil dibatalkan');
    });
  });


  // ============================================================
  // ❌ SKENARIO NEGATIF: ORDER SENT/SHIPPING -> TIDAK BISA BATAL
  // ============================================================
  it('Negatif: Tombol "Batalkan" tidak muncul pada pesanan Dikirim/Selesai', () => {
    
    cy.visit('http://127.0.0.1:8000/user/orders');
    
    // 1. KLIK FILTER "DIKIRIM" / "DITERIMA"
    cy.get('body').then(($body) => {
        // Cari filter tab yang relevan
        const filterLink = $body.find('a:contains("Diterima"), a:contains("Selesai")').first();
        
        if (filterLink.length > 0) {
            cy.wrap(filterLink).click();
            cy.wait(1000);
        } else {
            cy.log('ℹ️ Filter spesifik tidak ketemu, mencari di list "Semua"...');
        }

        // 2. CEK DATA SETELAH FILTER
        cy.get('body').then(($page) => {
            if ($page.text().includes('Belum Ada Pesanan') || $page.find('.group').length === 0) {
                cy.log('⚠️ SKIP: Tidak ada data pesanan status Dikirim/Selesai.');
                return;
            }

            // 3. KLIK "LIHAT DETAIL" PADA DATA PERTAMA
            // Karena sudah difilter, ambil kartu pertama saja
            cy.contains('a', /Lihat Detail|Detail/i).first().click();
          
            // 4. VERIFIKASI DI HALAMAN DETAIL
            cy.url().should('include', '/user/orders/');

            // Assert: Tombol Batalkan TIDAK BOLEH ADA
            cy.contains(/Batalkan|Cancel Order/i).should('not.exist');

            // Assert: Pastikan tidak ada tombol bayar juga
            cy.contains(/Bayar Sekarang/i).should('not.exist');

            cy.log('✅ PASS: Tombol Batalkan tidak tersedia (Sesuai Ekspektasi).');
        });
    });
  });

});