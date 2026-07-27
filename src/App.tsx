import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
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
import AdminShippingPage from '@/pages/admin/Shipping';
import AdminPayoutsPage from '@/pages/admin/Payouts';
import AdminPromotionsPage from '@/pages/admin/Promotions';
import AdminInventoryPage from '@/pages/admin/Inventory';
import AdminSupportPage from '@/pages/admin/Support';
import AdminCMSPage from '@/pages/admin/CMS';
import AdminAuditLogsPage from '@/pages/admin/AuditLogs';
import AdminUsers from '@/pages/admin/Users';
import AdminArtists from '@/pages/admin/Artists';
import AdminDesigners from '@/pages/admin/Designers';
import AdminSettingsPage from '@/pages/admin/Settings';
import AdminAnalytics from '@/pages/admin/Analytics';
import HealthCheck from '@/pages/HealthCheck';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
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
import UserProfile from '@/pages/user/Profile';
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
                  <Route path="/creators" element={<Home />} />
                  {/* Main auth routes */}
                  <Route path="/user-auth" element={<UserAuth />} />
                  <Route path="/artist-auth" element={<ArtistAuth />} />
                  <Route path="/designer-auth" element={<DesignerAuth />} />
                  <Route path="/admin-auth" element={<AdminAuth />} />
                  {/* Legacy redirects */}
                  <Route path="/auth" element={<UserAuth />} />
                  <Route path="/signup" element={<UserAuth />} />
                  <Route path="/login" element={<UserAuth />} />
                  {/* Password management */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/products" element={<Products />} />
            
            <Route path="/artists" element={<Artists />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/artist/:slug" element={<ArtistProfile />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
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
                    <Route path="shipping" element={<AdminShippingPage />} />
                    <Route path="payouts" element={<AdminPayoutsPage />} />
                    <Route path="promotions" element={<AdminPromotionsPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="support" element={<AdminSupportPage />} />
                    <Route path="cms" element={<AdminCMSPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                    <Route path="artists" element={<AdminArtists />} />
                    <Route path="designers" element={<AdminDesigners />} />
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
                  
                  {/* User Profile Route - Available to all authenticated users */}
                  <Route path="/user/profile" element={<UserProfile />} />
                  
                  <Route path="/health" element={<HealthCheck />} />
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
