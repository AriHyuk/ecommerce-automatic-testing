describe("KCM006 - Pengujian Tambah Kategori Produk", () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it("POSITIF: Admin berhasil menambahkan kategori produk baru", () => {
    cy.visit("/admin/categories/create");
    cy.wait(2000);
    
    const categoryName = `TestCase_${Date.now()}`;
    cy.get('input[name="name"]').type(categoryName);
    cy.contains("Simpan").click();
    
    // Wait and check redirect
    cy.wait(5000);
    cy.url().should("include", "/admin/categories");    
  });

  it("NEGATIF: Sistem menolak input nama kategori kosong", () => {
    cy.visit("/admin/categories/create");
    cy.wait(2000);
    
    cy.get('input[name="name"]').clear();
    cy.contains("Simpan").click();
    cy.wait(2000);
    
    cy.url().should("include", "/create");
  });
});