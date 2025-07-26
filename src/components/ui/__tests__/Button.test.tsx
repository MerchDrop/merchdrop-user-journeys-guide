import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renders button with text', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size styles correctly', () => {
    const { getByRole } = render(<Button size="lg">Large Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('h-11');
  });

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
  });
});