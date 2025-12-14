describe("KCM007 - Pengujian Tambah Produk", () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it("POSITIF: Admin berhasil menambahkan produk baru", () => {
    cy.visit("/admin/products/create");
    cy.wait(3000);
    
    cy.get('input[name="name"]').type(`Test_${Date.now()}`);
    
    cy.get('select[name="category_id"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.wrap($select).select(1);
      }
    });
    
    cy.get('input[name="base_price"]').type("90000");
    cy.get('textarea[name="description"]').type("Deskripsi panjang lebih dari 50 karakter untuk testing validasi sistem e-commerce.");
    
    cy.contains("Simpan Produk").click();
    cy.wait(5000);
    
    cy.url().should("include", "/admin/products");
  });

  it("NEGATIF: Admin gagal menambahkan produk ketika field wajib kosong (nama produk)", () => {
    cy.visit("/admin/products/create");
    cy.wait(3000);
    
    // Kosongkan nama produk, isi lainnya
    cy.get('select[name="category_id"]').then($select => {
      if ($select.find('option').length > 1) {
        cy.wrap($select).select(1);
      }
    });
    
    cy.get('input[name="base_price"]').type("100000");
    cy.get('textarea[name="description"]').type("Testing validasi dengan nama produk yang dikosongkan.");
    
    cy.contains("Simpan Produk").click();
    cy.wait(3000);
    
    cy.url().should("include", "/create");
  });
});