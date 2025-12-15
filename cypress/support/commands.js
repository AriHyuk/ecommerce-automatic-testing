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

  cy.get('input[name="email"], input[type="email"], #email', { timeout: 10000 })
    .first()
    .clear()
    .type(Cypress.env("adminEmail"));

  cy.get('input[name="password"], input[type="password"], #password')
    .first()
    .clear()
    .type(Cypress.env("adminPassword"), { log: false });

  cy.contains('button', /login|masuk/i).click();

  // tunggu redirect beneran
  cy.url({ timeout: 10000 }).should("not.include", "/login");
});


Cypress.Commands.add("userLogin", () => {
  cy.visit("/login");

  cy.get('input[name="email"], input[type="email"], #email', { timeout: 10000 })
    .first()
    .clear()
    .type(Cypress.env("userEmail"));

  cy.get('input[name="password"], input[type="password"], #password')
    .first()
    .clear()
    .type(Cypress.env("userPassword"), { log: false });

  cy.contains('button', /login|Masuk/i).click();

  cy.url({ timeout: 10000 }).should("not.include", "/login");
});
