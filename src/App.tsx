import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';
import ArtistProfile from '@/pages/ArtistProfile';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import HealthCheck from '@/pages/HealthCheck';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <HelmetProvider>
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </CartProvider>
  </HelmetProvider>
  );
}

export default App;
