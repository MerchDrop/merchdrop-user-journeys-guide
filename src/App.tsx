import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import Auth from '@/pages/Auth';
import AdminAuth from '@/pages/AdminAuth';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Shop from '@/pages/Shop';
import Artists from '@/pages/Artists';
import Cart from '@/pages/Cart';
import ArtistProfile from '@/pages/ArtistProfile';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import CleanDashboard from '@/pages/CleanDashboard';
import LiveDashboard from '@/pages/LiveDashboard';
import ArtistProducts from '@/pages/artist/Products';
import ArtistAnalytics from '@/pages/artist/Analytics';
import ArtistSettings from '@/pages/artist/Settings';
import ArtistProfilePage from '@/pages/artist/Profile';
import ArtistOrders from '@/pages/artist/Orders';
import ArtistPayouts from '@/pages/artist/Payouts';
import ArtistDesigns from '@/pages/artist/Designs';
import Admin from '@/pages/Admin';
import AdminProducts from '@/pages/admin/Products';
import AdminDesigns from '@/pages/admin/Designs';
import AdminOrders from '@/pages/admin/Orders';
import AdminUsers from '@/pages/admin/Users';
import AdminArtists from '@/pages/admin/Artists';
import AdminSettingsPage from '@/pages/admin/Settings';
import AdminAnalytics from '@/pages/admin/Analytics';
import HealthCheck from '@/pages/HealthCheck';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import UserAuth from '@/pages/UserAuth';
import ArtistAuth from '@/pages/ArtistAuth';
import ArtistOnboarding from '@/pages/ArtistOnboarding';
import DesignerAuth from '@/pages/DesignerAuth';
import DesignerDashboardPage from '@/pages/designer/Dashboard';
import DesignUploadPage from '@/pages/designer/Upload';
import MyDesignsPage from '@/pages/designer/Designs';
import AllArtistsPage from '@/pages/designer/Artists';
import DesignerAnalyticsPage from '@/pages/designer/Analytics';
import DesignerPayoutsPage from '@/pages/designer/Payouts';
import DesignerProfilePage from '@/pages/designer/Profile';
import DesignerSettings from '@/pages/designer/Settings';
import EmailConfirmation from '@/pages/EmailConfirmation';
import MerchCreator from '@/pages/MerchCreator';
import OrderTracking from '@/pages/OrderTracking';
import NotFound from '@/pages/NotFound';
import HowItWorksPage from '@/pages/HowItWorks';
import Pricing from '@/pages/Pricing';
import SuccessStories from '@/pages/SuccessStories';
import Support from '@/pages/Support';
import Shipping from '@/pages/Shipping';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import PendingApproval from '@/pages/PendingApproval';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';
import DesignerLayout from '@/layouts/DesignerLayout';

function App() {
  // Enable real-time subscriptions
  useRealtimeSubscriptions();

  return (
    <HelmetProvider>
      <AuthErrorBoundary>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <ScrollToTop />
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Shop />} />
                  <Route path="/shop" element={<Navigate to="/products" replace />} />
                  <Route path="/products" element={<Shop />} />
                  <Route path="/creators" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/user-auth" element={<UserAuth />} />
                  <Route path="/artist-auth" element={<ArtistAuth />} />
                  <Route path="/admin-auth" element={<AdminAuth />} />
                  <Route path="/designer-auth" element={<DesignerAuth />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/products" element={<Products />} />
            
            <Route path="/artists" element={<Artists />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/artist/:slug" element={<ArtistProfile />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/live-dashboard" element={<LiveDashboard />} />
                  
                  {/* Dashboard Routes - Protected for Artists */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<CleanDashboard />} />
                    <Route path="products" element={<ArtistProducts />} />
                    <Route path="designs" element={<ArtistDesigns />} />
                    <Route path="analytics" element={<ArtistAnalytics />} />
                    <Route path="settings" element={<ArtistSettings />} />
                    <Route path="orders" element={<ArtistOrders />} />
                    <Route path="payouts" element={<ArtistPayouts />} />
                    <Route path="profile" element={<ArtistProfilePage />} />
                  </Route>
                  
                  {/* Admin Routes - Protected for Admins */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Admin />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="designs" element={<AdminDesigns />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="artists" element={<AdminArtists />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                  
                  {/* Designer Routes - Protected for Designers */}
                  <Route path="/designer" element={<DesignerLayout />}>
                    <Route path="dashboard" element={<DesignerDashboardPage />} />
                    <Route path="upload" element={<DesignUploadPage />} />
                    <Route path="designs" element={<MyDesignsPage />} />
                    <Route path="artists" element={<AllArtistsPage />} />
                    <Route path="analytics" element={<DesignerAnalyticsPage />} />
                    <Route path="payouts" element={<DesignerPayoutsPage />} />
                    <Route path="profile" element={<DesignerProfilePage />} />
                    <Route path="settings" element={<DesignerSettings />} />
                  </Route>
                  
                  <Route path="/health" element={<HealthCheck />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<ArtistOnboarding />} />
                  <Route path="/create-merch" element={<MerchCreator />} />
                  <Route path="/order/:orderId" element={<OrderTracking />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
