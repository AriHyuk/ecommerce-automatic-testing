describe('KCM006 - Tambah Kategori Produk', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('Berhasil menambah kategori baru dengan input valid', () => {
    cy.visit('/admin/kategori');
    cy.contains('Tambah Kategori Baru').click();
    cy.get('input[name="nama_kategori"]').type('Elektronik Baru');
    cy.contains('Simpan').click();
    cy.contains('Kategori berhasil ditambahkan').should('be.visible');
    cy.contains('Elektronik Baru').should('exist');
  });

  it('Gagal menambah kategori jika nama kosong / duplikat', () => {
    cy.visit('/admin/kategori');
    cy.contains('Tambah Kategori Baru').click();
    cy.get('input[name="nama_kategori"]').clear();
    cy.contains('Simpan').click();
    cy.contains('Nama kategori tidak boleh kosong').should('be.visible');

    cy.get('input[name="nama_kategori"]').type('Elektronik'); // duplikat
    cy.contains('Simpan').click();
    cy.contains('Kategori sudah terdaftar').should('be.visible');
  });
});
