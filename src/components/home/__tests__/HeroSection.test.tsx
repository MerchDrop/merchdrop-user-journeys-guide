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

    expect(getByText(/Support the culture/)).toBeInTheDocument();
    expect(getByText('wear the creativity.')).toBeInTheDocument();
    expect(getByText(/Shop exclusive limited drops/)).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    const { getByRole } = renderWithRouter(<HeroSection />);

    const shopDropsLink = getByRole('link', { name: /shop drops/i });
    expect(shopDropsLink).toBeInTheDocument();
    expect(shopDropsLink).toHaveAttribute('href', '/products');

    const browseArtistsLink = getByRole('link', { name: /browse artists/i });
    expect(browseArtistsLink).toBeInTheDocument();
    expect(browseArtistsLink).toHaveAttribute('href', '/products');
  });

  it('displays the dashboard preview', () => {
    const { getByText } = renderWithRouter(<HeroSection />);

    expect(getByText('app.merchdrop.com/dashboard')).toBeInTheDocument();
    expect(getByText('Sales This Week')).toBeInTheDocument();
    expect(getByText('Recent Activity')).toBeInTheDocument();
  });
});
