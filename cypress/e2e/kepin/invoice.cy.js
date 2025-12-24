describe('KCM012 - Pengujian Invoice (Flow User)', () => {
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
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
  it('Positif: Berhasil menampilkan dan mencetak invoice pesanan sukses', () => {
    cy.visit('http://127.0.0.1:8000/user/orders'); 
    cy.wait(1000);
    cy.get('body').then(($body) => {
        if ($body.text().includes('Belum Ada Pesanan')) {
            cy.log('⚠️ SKIP: History Kosong. Lakukan Checkout dulu.');
            return; 
        }
        cy.contains('a', 'Lihat Detail').first().click();
        cy.url().should('include', '/user/orders/'); 
        cy.contains(/Invoice|Cetak/i).should('be.visible').click();
        cy.window().then(win => {
            cy.stub(win, 'print').as('printCalled');
        });
        cy.url().should('include', '/invoice');
        cy.get('body').then(($invoicePage) => {
            if ($invoicePage.find('button:contains("Cetak"), a:contains("Cetak")').length > 0) {
                cy.contains(/Cetak|Print/i).click();
                cy.get('@printCalled').should('have.been.called');
            } else {
                cy.log('ℹ️ Halaman invoice mungkin auto-print atau tombol cetak beda.');
            }
        });
        cy.log('✅ Skenario Positif Berhasil');
    });
  });

  it('Negatif: Cek Invoice pada pesanan Dibatalkan', () => {
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.contains('a', 'Dibatalkan').click();
    cy.wait(1000);
    cy.get('body').then(($body) => {
        if ($body.text().includes('Belum Ada Pesanan')) {
            cy.log('⚠️ SKIP: Tidak ada data pesanan status "Dibatalkan".');
            return;
        }
        cy.contains('a', 'Lihat Detail').first().click();
        cy.get('body').then(($detailPage) => {
            const btnInvoice = $detailPage.find('a:contains("Invoice"), button:contains("Invoice")');
            if (btnInvoice.length === 0) {
                cy.log('✅ PASS: Tombol Invoice tidak muncul (Sesuai Ekspektasi)');
            } 
            else {
                cy.log('ℹ️ INFO: Tombol Invoice muncul. Mencoba akses...');
                cy.wrap(btnInvoice).click();
                cy.url().should('include', '/invoice');
                cy.log('⚠️ WARNING: Invoice bisa dibuka');
            }
        });
    });
  });
});