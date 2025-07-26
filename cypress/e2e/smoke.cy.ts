describe('Smoke Test - Art Marketplace', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage', () => {
    cy.contains('Discover Unique Art').should('be.visible');
    cy.contains('Shop Now').should('be.visible');
    cy.get('header').should('be.visible');
  });

  it('should navigate to products page', () => {
    cy.contains('Shop Now').click();
    cy.url().should('include', '/products');
    cy.contains('Featured Products').should('be.visible');
  });

  it('should view product details', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.url().should('include', '/product/');
    cy.contains('Add to Cart').should('be.visible');
  });

  it('should add item to cart and proceed to checkout', () => {
    // Visit a product page
    cy.visit('/product/1');
    
    // Add to cart
    cy.contains('Add to Cart').click();
    cy.contains('Added to cart!').should('be.visible');
    
    // Go to cart
    cy.get('[data-testid="cart-button"]').click();
    cy.url().should('include', '/cart');
    
    // Proceed to checkout
    cy.contains('Proceed to Checkout').click();
    cy.url().should('include', '/checkout');
    cy.contains('Cart Review').should('be.visible');
  });

  it('should navigate through checkout steps', () => {
    // Add item to cart first
    cy.visit('/product/1');
    cy.contains('Add to Cart').click();
    
    // Go to checkout
    cy.visit('/checkout');
    
    // Step 1: Cart Review
    cy.contains('Cart Review').should('be.visible');
    cy.contains('Continue to Shipping').click();
    
    // Step 2: Shipping
    cy.contains('Shipping Information').should('be.visible');
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('input[name="address"]').type('123 Main St');
    cy.get('input[name="city"]').type('New York');
    cy.get('input[name="zipCode"]').type('10001');
    cy.contains('Continue to Payment').click();
    
    // Step 3: Payment
    cy.contains('Payment Information').should('be.visible');
  });

  it('should search for artists', () => {
    cy.visit('/');
    cy.contains('Browse Artists').click();
    cy.url().should('include', '/artist/');
    cy.contains('Follow').should('be.visible');
  });

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.contains('Discover Unique Art').should('be.visible');
    
    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.contains('Discover Unique Art').should('be.visible');
  });
});