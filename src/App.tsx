import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';
import ArtistProfile from '@/pages/ArtistProfile';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import ArtistProducts from '@/pages/artist/Products';
import ArtistAnalytics from '@/pages/artist/Analytics';
import ArtistSettings from '@/pages/artist/Settings';
import ArtistOrders from '@/pages/artist/Orders';
import Admin from '@/pages/Admin';
import HealthCheck from '@/pages/HealthCheck';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import MerchCreator from '@/pages/MerchCreator';
import OrderTracking from '@/pages/OrderTracking';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <HelmetProvider>
      <CurrencyProvider>
        <CartProvider>
        <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/artist/:slug" element={<ArtistProfile />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/products" element={<ArtistProducts />} />
          <Route path="/dashboard/analytics" element={<ArtistAnalytics />} />
          <Route path="/dashboard/settings" element={<ArtistSettings />} />
          <Route path="/dashboard/orders" element={<ArtistOrders />} />
          <Route path="/admin" element={<Admin />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ArtistOnboarding />} />
            <Route path="/create-merch" element={<MerchCreator />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </CartProvider>
      </CurrencyProvider>
  </HelmetProvider>
  );
}

export default App;
