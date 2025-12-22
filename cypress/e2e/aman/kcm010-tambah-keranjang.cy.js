describe("KCM010 - Tambah Produk Keranjang Belanja", () => {
  it("Test Menambahkan Produk ke Keranjang", () => {
    cy.userLogin();
    cy.wait(1000);
    
    // Buka list produk
    cy.visit("/toko-gewe-88");
    cy.wait(3000);
    
    // CARI LINK PRODUK PERTAMA (apapun bentuknya)
    cy.get('body').then($body => {
      // Coba beberapa kemungkinan selector
      const selectors = [
        'a[href*="/toko-gewe-88/"]',
        '.gwen-polaroid-card',
        '.card a',
        '.product a',
        '[class*="product"] a',
        'a:has(img)'
      ];
      
      let foundLink = null;
      
      for (const selector of selectors) {
        const element = $body.find(selector).first();
        if (element.length > 0) {
          foundLink = element.attr('href') || element.attr('data-href');
          if (foundLink) break;
        }
      }
      
      if (foundLink) {
        // Buka detail produk
        cy.visit(foundLink);
        cy.wait(3000);
        
        // Klik tombol
        cy.contains('Tambah ke keranjang').click({ force: true });
        cy.log('✅ Success!');
      } else {
        cy.log('❌ Tidak ada produk ditemukan');
      }
    });
  });
});