// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("adminLogin", () => {
  cy.visit("/login");
  
  // Cek halaman login
  cy.get('body').then(($body) => {
    // Cari input email dengan berbagai kemungkinan selector
    if ($body.find('input[name="email"]').length > 0) {
      cy.get('input[name="email"]').type(Cypress.env("adminEmail"));
    } else if ($body.find('input[type="email"]').length > 0) {
      cy.get('input[type="email"]').type(Cypress.env("adminEmail"));
    } else if ($body.find('#email').length > 0) {
      cy.get('#email').type(Cypress.env("adminEmail"));
    }
    
    // Cari input password
    if ($body.find('input[name="password"]').length > 0) {
      cy.get('input[name="password"]').type(Cypress.env("adminPassword"));
    } else if ($body.find('input[type="password"]').length > 0) {
      cy.get('input[type="password"]').type(Cypress.env("adminPassword"));
    } else if ($body.find('#password').length > 0) {
      cy.get('#password').type(Cypress.env("adminPassword"));
    }
    
    // Cari tombol submit
    if ($body.find('button[type="submit"]').length > 0) {
      cy.get('button[type="submit"]').click();
    } else if ($body.find('button:contains("Login")').length > 0) {
      cy.contains('button', 'Login').click();
    } else if ($body.find('button:contains("Masuk")').length > 0) {
      cy.contains('button', 'Masuk').click();
    }
  });
  
  // Tunggu redirect
  cy.wait(3000);
  
  // Verifikasi login berhasil
  cy.url().should("not.include", "/login");
});

Cypress.Commands.add("userLogin", () => {
  cy.visit("/login");
  
  cy.get('body').then(($body) => {
    if ($body.find('input[name="email"]').length > 0) {
      cy.get('input[name="email"]').type(Cypress.env("userEmail"));
    } else if ($body.find('input[type="email"]').length > 0) {
      cy.get('input[type="email"]').type(Cypress.env("userEmail"));
    }
    
    if ($body.find('input[name="password"]').length > 0) {
      cy.get('input[name="password"]').type(Cypress.env("userPassword"));
    } else if ($body.find('input[type="password"]').length > 0) {
      cy.get('input[type="password"]').type(Cypress.env("userPassword"));
    }
    
    if ($body.find('button[type="submit"]').length > 0) {
      cy.get('button[type="submit"]').click();
    } else if ($body.find('button:contains("Login")').length > 0) {
      cy.contains('button', 'Login').click();
    }
  });
  
  cy.wait(3000);
  cy.url().should("not.include", "/login");
});