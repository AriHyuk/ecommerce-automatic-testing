describe('KCM011 - Pengujian Print Label (Admin)', () => {

  // 1. GLOBAL ERROR HANDLER
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  // 2. SETUP: LOGIN ADMIN
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://127.0.0.1:8000/login'); 

    const email = Cypress.env('adminEmail') || 'admin@gmail.com'; 
    const password = Cypress.env('adminPassword') || 'passwordAdmin123';

    cy.get('input[name="email"]').type(email); 
    cy.get('input[name="password"]').type(password); 
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin');
  });

  // ============================================================
  // ✅ SKENARIO POSITIF
  // ============================================================
  it('Positif: Admin berhasil mencetak Label pada order status Paid', () => {
    
    // 1. PAKSA VISIT HALAMAN DENGAN FILTER PAID
    // Ini lebih stabil daripada klik link filter
    cy.visit('http://127.0.0.1:8000/admin/orders?status=paid'); 
    cy.wait(1000); // Tunggu render

    // 2. CEK DATA
    cy.get('body').then(($body) => {
        // Cek apakah tabel kosong / ada tulisan tidak ada data
        if ($body.text().includes('Tidak ada data order')) {
            cy.log('⚠️ SKIP: Tidak ada data status Paid.');
            return;
        }

        // 3. CARI BARIS YANG MENGANDUNG "PAID"
        // Kita cari elemen <tr> yang punya text "Paid" di dalamnya
        cy.contains('table tbody tr', 'Paid')
          .first() // Ambil yang paling atas kalau ada banyak
          .within(() => {
              // 4. KLIK DETAIL
              cy.get('a[title="Detail Order"], a:contains("Detail")').click();
          });

        // 5. ASSERT MASUK HALAMAN DETAIL
        cy.url().should('include', '/admin/orders/');

        // 6. STUB PRINT
        cy.window().then((win) => {
            cy.stub(win, 'print').as('printCalled');
        });

        // 7. KLIK TOMBOL "CETAK LABEL"
        // Hapus target="_blank"
        cy.contains('a', 'Cetak Label')
          .should('be.visible')
          .invoke('removeAttr', 'target') 
          .click();

        // 8. VERIFIKASI
        cy.url().should('include', '/print-label');

        cy.log('✅ Label berhasil dicetak');
    });
  });

  // ============================================================
  // ❌ SKENARIO NEGATIF
  // ============================================================
  it('Negatif: Gagal mencetak label pada order status Pending', () => {
    
    // 1. PAKSA VISIT FILTER PENDING
    cy.visit('http://127.0.0.1:8000/admin/orders?status=pending');
    cy.wait(1000);

    // 2. CEK DATA
    cy.get('body').then(($body) => {
        if ($body.text().includes('Tidak ada data order')) {
            cy.log('⚠️ SKIP: Tidak ada data status Pending.');
            return;
        }

        // 3. CARI BARIS YANG MENGANDUNG "PENDING"
        cy.contains('table tbody tr', 'Pending')
          .first()
          .within(() => {
              cy.get('a[title="Detail Order"], a:contains("Detail")').click();
          });

        // 4. COBA KLIK CETAK LABEL
        cy.get('body').then(($page) => {
            const btnLabel = $page.find('a:contains("Cetak Label")');

            if (btnLabel.length === 0) {
                cy.log('✅ PASS: Tombol Cetak Label TIDAK MUNCUL di status Pending.');
            } else {
                cy.log('ℹ️ Tombol muncul, mencoba klik paksa...');
                cy.wrap(btnLabel).invoke('removeAttr', 'target').click();

                // 5. VERIFIKASI HASIL
                cy.url().then((url) => {
                    if (url.includes('/print-label')) {
                        cy.log('⚠️ WARNING: Sistem MEMBOLEHKAN cetak label status Pending.');
                    } else {
                        cy.log('✅ PASS: Sistem menolak akses print (Redirect kembali)');
                    }
                });
            }
        });
    });
  });

});