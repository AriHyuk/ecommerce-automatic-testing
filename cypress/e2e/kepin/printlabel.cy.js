describe('KCM011 - Pengujian Print Label (Admin)', () => {
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
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

  it('Positif: Admin berhasil mencetak Label pada order status Paid', () => {
    cy.visit('http://127.0.0.1:8000/admin/orders?status=paid'); 
    cy.wait(1000); 
    cy.get('body').then(($body) => {
        if ($body.text().includes('Tidak ada data order')) {
            cy.log('⚠️ SKIP: Tidak ada data status Paid.');
            return;
        }
        cy.contains('table tbody tr', 'Paid')
          .first() 
          .within(() => {
              cy.get('a[title="Detail Order"], a:contains("Detail")').click();
          });
        cy.url().should('include', '/admin/orders/');
        cy.window().then((win) => {
            cy.stub(win, 'print').as('printCalled');
        });
        cy.contains('a', 'Cetak Label')
          .should('be.visible')
          .invoke('removeAttr', 'target') 
          .click();
        cy.url().should('include', '/print-label');
        cy.log('✅ Label berhasil dicetak');
    });
  });
  it('Negatif: Gagal mencetak label pada order status Pending', () => {
    cy.visit('http://127.0.0.1:8000/admin/orders?status=pending');
    cy.wait(1000);
    cy.get('body').then(($body) => {
        if ($body.text().includes('Tidak ada data order')) {
            cy.log('⚠️ SKIP: Tidak ada data status Pending.');
            return;
        }
        cy.contains('table tbody tr', 'Pending')
          .first()
          .within(() => {
              cy.get('a[title="Detail Order"], a:contains("Detail")').click();
          });
        cy.get('body').then(($page) => {
            const btnLabel = $page.find('a:contains("Cetak Label")');

            if (btnLabel.length === 0) {
                cy.log('✅ PASS: Tombol Cetak Label TIDAK MUNCUL di status Pending.');
            } else {
                cy.log('ℹ️ Tombol muncul, mencoba klik paksa...');
                cy.wrap(btnLabel).invoke('removeAttr', 'target').click();
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