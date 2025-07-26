import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HeroSection from '../HeroSection';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HeroSection', () => {
  it('renders hero content correctly', () => {
    const { getByText } = renderWithRouter(<HeroSection />);
    
    expect(getByText('Discover Unique Art')).toBeInTheDocument();
    expect(getByText(/Support independent artists/)).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    const { getByRole } = renderWithRouter(<HeroSection />);
    
    const shopNowButton = getByRole('link', { name: /shop now/i });
    expect(shopNowButton).toBeInTheDocument();
    expect(shopNowButton).toHaveAttribute('href', '/products');
  });

  it('displays hero image', () => {
    const { getByAltText } = renderWithRouter(<HeroSection />);
    
    const heroImage = getByAltText('Hero image showcasing art marketplace');
    expect(heroImage).toBeInTheDocument();
  });
});