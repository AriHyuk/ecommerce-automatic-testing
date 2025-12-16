describe('KCM001 - Pengujian Register', () => {

  // 1. GLOBAL ERROR HANDLER
  // Mencegah test berhenti jika ada error script pihak ketiga (seperti map/tracker)
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  // Setup sebelum setiap test
  beforeEach(() => {
    // Sesuaikan viewport agar tampilan desktop
    cy.viewport(1280, 720);
    // Masuk ke halaman register (Sesuaikan URL jika beda)
    // Jika tidak ada akses langsung, bisa via Home -> Klik Daftar
    cy.visit('http://127.0.0.1:8000/register'); 
  });

  // ============================================================
  // SKENARIO NEGATIF
  // ID: KCM001 - Negatif
  // Deskripsi: Coba daftar dengan data kosong/invalid
  // ============================================================
  it('Negatif: Gagal daftar jika kolom wajib kosong', () => {
    // 1. Pastikan ada di halaman register
    cy.url().should('include', '/register');

    // 2. Biarkan semua kolom kosong, langsung klik Daftar
    cy.get('button[type="submit"]').click();

    // 3. Verifikasi (Expected Result)
    // Browser biasanya menahan submit jika ada atribut 'required' di HTML
    // Atau jika backend menolak, URL tidak akan berubah ke halaman login/home
    
    // Assert 1: URL masih tetap di register (tidak redirect sukses)
    cy.url().should('include', '/register');

    // Assert 2: Cek validasi browser atau pesan error
    // Cypress bisa mengecek validasi HTML5 'required'
    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });

    cy.log('✅ Skenario Negatif Berhasil: User tertahan di halaman register');
  });

  // ============================================================
  // SKENARIO POSITIF
  // ID: KCM001 - Positif
  // Deskripsi: Daftar dengan data valid
  // ============================================================
  it('Positif: Berhasil registrasi dengan data valid', () => {
    // Agar email selalu unik dan tidak error "Email already taken",
    // kita gunakan Random Number generator
    const randomNum = Math.floor(Math.random() * 100000);
    const uniqueEmail = `testing${randomNum}@gmail.com`;
    const uniqueWA = `0812${randomNum}`;

    // 1. Isi Nama Lengkap
    cy.get('input[name="name"]') // atau cy.get('#name')
      .type('User Testing Cypress');

    // 2. Isi Email Valid
    cy.get('input[name="email"]') // atau cy.get('#email')
      .type(uniqueEmail);

    // 3. Isi No Whatsapp (Sesuai kolom di checkout kamu tadi ada WA)
    // Jika di register tidak ada WA, hapus bagian ini
    cy.get('body').then(($body) => {
        if ($body.find('input[name="whatsapp"]').length > 0) {
            cy.get('input[name="whatsapp"]').type(uniqueWA);
        } else if ($body.find('input[name="phone"]').length > 0) {
            cy.get('input[name="phone"]').type(uniqueWA);
        }
    });

    // 4. Isi Password
    cy.get('input[name="password"]') // atau cy.get('#password')
      .type('Password123!');

    // 5. Konfirmasi Password (Jika ada kolom confirm password)
    cy.get('body').then(($body) => {
        if ($body.find('input[name="password_confirmation"]').length > 0) {
            cy.get('input[name="password_confirmation"]').type('Password123!');
        }
    });

    // 6. Klik Tombol Daftar
    cy.get('button[type="submit"]').click();

    // 7. Verifikasi (Expected Result)
    // Biasanya setelah daftar diarahkan ke Login atau Home atau Dashboard User
    // Pastikan URL TIDAK LAGI di /register
    cy.url({ timeout: 10000 }).should('not.include', '/register');

    // Opsional: Cek pesan sukses jika ada
    // cy.contains('Berhasil').should('be.visible');

    cy.log(`✅ Skenario Positif Berhasil: User terdaftar dengan email ${uniqueEmail}`);
  });

});