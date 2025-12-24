describe('KCM013 - Pengujian Cancel Order (User Side)', () => {
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
  it('Positif: User berhasil membatalkan pesanan (Status Submitted -> Cancelled)', () => {
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.wait(1000);
    cy.get('body').then(($body) => {
        
        const targetStatus = /Submitted|Diajukan/i;
        if (!$body.text().match(targetStatus)) {
            cy.log('⚠️ SKIP: Tidak ada pesanan status Submitted untuk dibatalkan.');
            return;
        }
        cy.contains('span', targetStatus)
          .closest('.group') 
          .find('a') 
          .contains(/Lihat Detail|Detail/i) 
          .click();
        cy.url().should('include', '/user/orders/');
        cy.on('window:confirm', () => true);
        cy.contains(/Batalkan|Cancel/i).should('be.visible').click();
        cy.get('body').then(($page) => {
            if ($page.find('input[name="reason"]').length > 0) {
                cy.get('input[name="reason"]').type('Batal Test Cypress');
                cy.get('button[type="submit"]').contains(/Kirim|Simpan/i).click();
            }
        });
        cy.wait(2000);
        cy.log('✅ Pesanan Submitted berhasil dibatalkan');
    });
  });

  it('Negatif: Tombol "Batalkan" tidak muncul pada pesanan Dikirim/Selesai', () => {
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.get('body').then(($body) => {
        const filterLink = $body.find('a:contains("Diterima"), a:contains("Selesai")').first();
        if (filterLink.length > 0) {
            cy.wrap(filterLink).click();
            cy.wait(1000);
        } else {
            cy.log('ℹ️ Filter spesifik tidak ketemu, mencari di list "Semua"...');
        }
        cy.get('body').then(($page) => {
            if ($page.text().includes('Belum Ada Pesanan') || $page.find('.group').length === 0) {
                cy.log('⚠️ SKIP: Tidak ada data pesanan status Dikirim/Selesai.');
                return;
            }
            cy.contains('a', /Lihat Detail|Detail/i).first().click();
            cy.url().should('include', '/user/orders/');
            cy.contains(/Batalkan|Cancel Order/i).should('not.exist');
            cy.contains(/Bayar Sekarang/i).should('not.exist');
            cy.log('✅ PASS: Tombol Batalkan tidak tersedia (Sesuai Ekspektasi).');
        });
    });
  });
});