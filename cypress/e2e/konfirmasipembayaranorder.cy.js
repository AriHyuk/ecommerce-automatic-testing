it("Konfirmasi Pembayaran via WhatsApp", () => {

    // 1. Login
    cy.visit("/login");
    cy.get('input[name="email"]').type("ariawl0209@gmail.com");
    cy.get('input[name="password"]').type("AriHyuk123");
    cy.get("#login-btn").click();

    cy.url().then((url) => {
    cy.log("URL setelah login:", url);
});


    // 2. Pastikan sudah masuk dashboard
    cy.url().should("not.include", "/login");

    // 3. Klik "My Account"
    // biasanya ada di sidebar
    cy.contains("My Account").click({ force: true });

    // 4. Klik menu "Pesanan Saya"
    cy.contains("Pesanan Saya").click({ force: true });

    // 5. Klik salah satu pesanan → detail
    cy.get('a[href*="/user/orders/"]').first().click();

    // 6. Klik tombol "Bayar Sekarang"
    cy.contains("Bayar Sekarang").click();

    // 7. Pastikan masuk ke halaman /pay
    cy.url().should("include", "/pay");

    // 8. Pastikan tombol Konfirmasi via WhatsApp tampil
    cy.get('a[href*="wa.me"]').should("be.visible");

    // 9. Validasi link WA
    cy.get('a[href*="wa.me"]').should("have.attr", "href")
      .and("include", "wa.me");

    // 10. Klik tombol WA (hapus target biar Cypress bisa follow)
    cy.get('a[href*="wa.me"]').invoke("removeAttr", "target").click();

    // 11. Pastikan redirect menuju WA
    cy.url().should("include", "wa.me");

});
