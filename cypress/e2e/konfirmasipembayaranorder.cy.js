it("Admin mengonfirmasi pembayaran pesanan Pending", () => {

    // 1. LOGIN ADMIN
    cy.visit("/login");
    cy.get('input[name="email"]').type("administrator@ptkundalinicahayamakmur.com");
    cy.get('input[name="password"]').type("kund@l1n1C@h@y@");
    cy.get("#login-btn").click();

    // 2. VALIDASI MASUK DASHBOARD ADMIN
    cy.url().should("include", "/admin");
    cy.contains("Dashboard").should("be.visible");

    // 3. MASUK KE MENU MANAJEMEN ORDER
    cy.contains("Manajemen Order").click({ force: true });

    // Pastikan daftar order tampil
    cy.url().should("include", "/admin/orders");

    // 4. SCROLL KE BAWAH (jaga-jaga jika item banyak)
    cy.scrollTo("bottom", { duration: 800 });

    // 5. TEMUKAN ORDER DENGAN STATUS "Pending"
    cy.contains("span", "Pending")        // badge warna orange
        .first()                          // ambil yang pertama ditemukan
        .parents("tr")                    // ambil row dari tabel
        .as("orderPending");

    // 6. KLIK TOMBOL "Detail" DI BARIS TERSEBUT
    cy.get("@orderPending")
        .find("a, button")
        .contains("Detail")
        .click({ force: true });

    // 7. VALIDASI MASUK HALAMAN DETAIL ORDER
    cy.url().should("include", "/admin/orders/");

    // 8. KLIK "Konfirmasi via WhatsApp"
    cy.contains("Konfirmasi via WA", { timeout: 8000 })
  .should("be.visible")
  .click({ force: true });




// WA open in wa.me
cy.url().should("include", "wa.me");

// Stop here — do NOT click "Open WhatsApp"
cy.log("WhatsApp link opened successfully");


});
