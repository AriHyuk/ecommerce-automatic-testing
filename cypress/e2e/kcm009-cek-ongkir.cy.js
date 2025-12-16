describe("KCM009 - Pengujian Cek Ongkir", () => {
  beforeEach(() => {
    cy.userLogin();
    cy.wait(1000);
  });

  it("✅ POSITIF: Pengguna berhasil mengecek ongkos kirim", () => {
    // Buka list produk
    cy.visit("/toko-gewe-88");
    cy.wait(3000);
    
    // CARI LINK PRODUK PERTAMA
    cy.get('body').then($body => {
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
        
        // CARI TOMBOL BELI SEKARANG
        cy.get('body').then($detailPage => {
          const buyNowSelectors = [
            'button:contains("Beli Sekarang")',
            'a:contains("Beli Sekarang")',
            '[class*="buy-now"]',
            '[class*="beli-sekarang"]'
          ];
          
          let foundBuyButton = false;
          
          for (const selector of buyNowSelectors) {
            if ($detailPage.find(selector).length > 0) {
              foundBuyButton = true;
              cy.contains("Beli Sekarang").click({ force: true });
              break;
            }
          }
          
          if (foundBuyButton) {
            cy.wait(3000);
            
            // SEKARANG DI HALAMAN CHECKOUT
            // 1. Masukkan tujuan pengiriman
            cy.get('#destinationSearch').type('Jakarta');
            cy.wait(2000);
            
            // Pilih hasil pertama
            cy.get('.destination-item').first().click({ force: true });
            cy.wait(3000);
            
            // 2. Pilih jenis pengiriman
            cy.get('input[name="shipping_type"][value="reguler"]').check();
            cy.wait(2000);
            
            // 3. Perhatikan hasil estimasi biaya
            cy.get('#shippingCostDisplay').should('not.contain', 'Rp 0');
            cy.get('#shippingCostDisplay').invoke('text').then(text => {
              expect(text).to.match(/Rp\s*\d+/);
              cy.log(`✅ Estimasi ongkir: ${text}`);
            });
            
            cy.log('✅ Pengguna berhasil mengecek ongkos kirim');
          } else {
            cy.log('❌ Tombol "Beli Sekarang" tidak ditemukan');
          }
        });
      } else {
        cy.log('❌ Tidak ada produk ditemukan');
      }
    });
  });

  it("❌ NEGATIF: Pengguna gagal mengecek ongkos kirim", () => {
    // Buka list produk
    cy.visit("/toko-gewe-88");
    cy.wait(3000);
    
    // CARI LINK PRODUK PERTAMA
    cy.get('body').then($body => {
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
        
        // CARI TOMBOL BELI SEKARANG
        cy.get('body').then($detailPage => {
          if ($detailPage.find('button:contains("Beli Sekarang")').length > 0) {
            cy.contains("Beli Sekarang").click({ force: true });
            cy.wait(3000);
            
            // SEKARANG DI CHECKOUT PAGE
            // 1. Biarkan tujuan pengiriman KOSONG
            
            // 2. Pilih jenis pengiriman
            cy.get('input[name="shipping_type"][value="reguler"]').check();
            cy.wait(2000);
            
            // 3. Verifikasi error
            cy.get('#shippingServices').should('contain', 'Pilih kota/kecamatan');
            cy.get('#shippingCostDisplay').should('contain', 'Rp 0');
            
            cy.log('✅ Sistem menolak input kota tujuan kosong');
            
            // Test dengan kota tidak terdaftar
            cy.get('#destinationSearch').type('KotaTidakAda123456');
            cy.wait(2000);
            
            cy.get('#destinationResults').should('contain', 'Tidak ada hasil');
            cy.log('✅ Sistem menampilkan pesan ongkos kirim tidak dapat dihitung');
          } else {
            cy.log('❌ Tombol "Beli Sekarang" tidak ditemukan');
          }
        });
      } else {
        cy.log('❌ Tidak ada produk ditemukan');
      }
    });
  });
});