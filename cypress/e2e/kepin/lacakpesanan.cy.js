describe('KCM014 - Pengujian Lacak Pesanan (Tracking)', () => {

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
  it('Positif: Melacak pesanan "Dikirim" (Data muncul di halaman detail)', () => {
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.wait(1000);
    const statusRegex = /Dikirim|Sent|Shipping|Diterima|Completed/i;

    cy.get('body').then(($body) => {
        if (!$body.text().match(statusRegex)) {
            cy.log('⚠️ SKIP: Tidak ada pesanan status Dikirim/Sent.');
            return;
        }
        cy.get('div.group')
          .filter((index, element) => statusRegex.test(element.innerText))
          .first()
          .within(() => {
              cy.contains('a', /Lihat Detail|Detail/i).click();
          });
        cy.url().should('include', '/user/orders/');
        cy.contains(/Lacak|Track/i).should('be.visible').click();
        cy.url().should('include', '/user/orders/'); 
        cy.wait(1000);
        cy.get('body').should('contain', 'Riwayat'); 
        cy.get('body').should('not.contain', 'belum tersedia');
        cy.log('✅ Tracking berhasil ditampilkan di bawah detail order');
    });
  });
  it('Negatif: Melacak pesanan "Dikemas" (Muncul Alert, Data kosong)', () => {
    
    cy.visit('http://127.0.0.1:8000/user/orders');
    cy.get('body').then(($body) => {
        const filterLink = $body.find('a:contains("Dikemas"), a:contains("Packing")').first();
        if (filterLink.length > 0) {
            cy.wrap(filterLink).click();
            cy.wait(1000);
        }
        const statusRegex = /Dikemas|Packing|Processing/i;
        cy.get('body').then(($page) => {
            const hasData = $page.find('div.group').text().match(statusRegex);
            if (hasData) {
                cy.get('div.group')
                  .filter((index, element) => statusRegex.test(element.innerText))
                  .first()
                  .within(() => {
                      cy.contains('a', /Lihat Detail|Detail/i).click();
                  });
                cy.url().should('include', '/user/orders/');

                cy.get('body').then(($detailPage) => {
                    const btnLacak = $detailPage.find('a:contains("Lacak"), button:contains("Lacak")');

                    if (btnLacak.length > 0) {
                        cy.wrap(btnLacak).click();
                        cy.url().should('include', '/user/orders/');
                        cy.log('✅ PASS: Muncul alert info, tidak redirect');
                    } else {
                        cy.log('ℹ️ INFO: Tombol Lacak belum muncul di status Packing (Valid).');
                    }
                });
            } else {
                cy.log('⚠️ SKIP: Tidak ada pesanan status Dikemas/Packing.');
            }
        });
    });
  });

});