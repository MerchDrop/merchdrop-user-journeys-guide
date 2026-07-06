import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../CartContext';
import { CurrencyProvider } from '../CurrencyContext';

// Test component to access cart context
const TestComponent = () => {
  const { items, addItem, removeItem, clearCart, getTotalPrice } = useCart();

  return (
    <div>
      <div data-testid="cart-items">{items.length}</div>
      <div data-testid="cart-total">${getTotalPrice().toFixed(2)}</div>
      <button
        onClick={() => addItem({
          id: '1',
          name: 'Test Product',
          price: 29.99,
          image: '/test.jpg',
          artist: 'Test Artist'
        })}
      >
        Add Item
      </button>
      <button
        onClick={() => addItem({
          id: '2',
          name: 'Second Product',
          price: 10.00,
          image: '/test2.jpg',
          artist: 'Test Artist'
        })}
      >
        Add Second Item
      </button>
      <button onClick={() => removeItem('1')}>
        Remove Item
      </button>
      <button onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
};

// CartProvider depends on CurrencyProvider for price formatting
const renderWithProvider = () => {
  return render(
    <CurrencyProvider>
      <CartProvider>
        <TestComponent />
      </CartProvider>
    </CurrencyProvider>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // The cart persists to localStorage; isolate each test
    localStorage.clear();
  });

  it('starts with empty cart', () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId('cart-items')).toHaveTextContent('0');
    expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
  });

  it('adds items to cart', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = renderWithProvider();

    await user.click(getByText('Add Item'));

    expect(getByTestId('cart-items')).toHaveTextContent('1');
    expect(getByTestId('cart-total')).toHaveTextContent('$29.99');
  });

  it('merges duplicate items instead of adding a new row', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = renderWithProvider();

    await user.click(getByText('Add Item'));
    await user.click(getByText('Add Item'));

    // Same product added twice: one row, doubled total
    expect(getByTestId('cart-items')).toHaveTextContent('1');
    expect(getByTestId('cart-total')).toHaveTextContent('$59.98');
  });

  it('removes items from cart', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = renderWithProvider();

    // Add item first
    await user.click(getByText('Add Item'));
    expect(getByTestId('cart-items')).toHaveTextContent('1');

    // Remove item
    await user.click(getByText('Remove Item'));
    expect(getByTestId('cart-items')).toHaveTextContent('0');
    expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
  });

  it('clears entire cart', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = renderWithProvider();

    // Add two distinct items
    await user.click(getByText('Add Item'));
    await user.click(getByText('Add Second Item'));
    expect(getByTestId('cart-items')).toHaveTextContent('2');

    // Clear cart
    await user.click(getByText('Clear Cart'));
    expect(getByTestId('cart-items')).toHaveTextContent('0');
    expect(getByTestId('cart-total')).toHaveTextContent('$0.00');
  });
});
