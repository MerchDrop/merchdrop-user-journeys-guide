/// <reference types="cypress" />

// Custom commands
Cypress.Commands.add('addToCart', (productId: string) => {
  cy.visit(`/product/${productId}`);
  cy.contains('Add to Cart').click();
  cy.contains('Added to cart!').should('be.visible');
});

Cypress.Commands.add('clearCart', () => {
  cy.visit('/cart');
  cy.get('[data-testid="clear-cart"]').click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      addToCart(productId: string): Chainable<void>;
      clearCart(): Chainable<void>;
    }
  }
}

export {};