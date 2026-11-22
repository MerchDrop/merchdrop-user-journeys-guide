import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import Home from '@/pages/Home';

const AdminAuth = lazy(() => import('@/pages/AdminAuth'));
const Products = lazy(() => import('@/pages/Products'));
const Shop = lazy(() => import('@/pages/Shop'));
const Artists = lazy(() => import('@/pages/Artists'));
const Cart = lazy(() => import('@/pages/Cart'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const CleanDashboard = lazy(() => import('@/pages/CleanDashboard'));
const ArtistProducts = lazy(() => import('@/pages/artist/Products'));
const ArtistAnalytics = lazy(() => import('@/pages/artist/Analytics'));
const ArtistSettings = lazy(() => import('@/pages/artist/Settings'));
const ArtistProfilePage = lazy(() => import('@/pages/artist/Profile'));
const ArtistOrders = lazy(() => import('@/pages/artist/Orders'));
const ArtistPayouts = lazy(() => import('@/pages/artist/Payouts'));
const ArtistDesigns = lazy(() => import('@/pages/artist/Designs'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminDesigns = lazy(() => import('@/pages/admin/Designs'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminShippingPage = lazy(() => import('@/pages/admin/Shipping'));
const AdminPayoutsPage = lazy(() => import('@/pages/admin/Payouts'));
const AdminPromotionsPage = lazy(() => import('@/pages/admin/Promotions'));
const AdminInventoryPage = lazy(() => import('@/pages/admin/Inventory'));
const AdminSupportPage = lazy(() => import('@/pages/admin/Support'));
const AdminCMSPage = lazy(() => import('@/pages/admin/CMS'));
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AuditLogs'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminArtists = lazy(() => import('@/pages/admin/Artists'));
const AdminDesigners = lazy(() => import('@/pages/admin/Designers'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/Settings'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const HealthCheck = lazy(() => import('@/pages/HealthCheck'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const UserAuth = lazy(() => import('@/pages/UserAuth'));
const ArtistAuth = lazy(() => import('@/pages/ArtistAuth'));
const ArtistOnboarding = lazy(() => import('@/pages/ArtistOnboarding'));
const DesignerAuth = lazy(() => import('@/pages/DesignerAuth'));
const DesignerDashboardPage = lazy(() => import('@/pages/designer/Dashboard'));
const DesignUploadPage = lazy(() => import('@/pages/designer/Upload'));
const MyDesignsPage = lazy(() => import('@/pages/designer/Designs'));
const AllArtistsPage = lazy(() => import('@/pages/designer/Artists'));
const DesignerAnalyticsPage = lazy(() => import('@/pages/designer/Analytics'));
const DesignerPayoutsPage = lazy(() => import('@/pages/designer/Payouts'));
const DesignerProfilePage = lazy(() => import('@/pages/designer/Profile'));
const DesignerSettings = lazy(() => import('@/pages/designer/Settings'));
const EmailConfirmation = lazy(() => import('@/pages/EmailConfirmation'));
const MerchCreator = lazy(() => import('@/pages/MerchCreator'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const Orders = lazy(() => import('@/pages/Orders'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const UserProfile = lazy(() => import('@/pages/user/Profile'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorks'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const SuccessStories = lazy(() => import('@/pages/SuccessStories'));
const Support = lazy(() => import('@/pages/Support'));
const Shipping = lazy(() => import('@/pages/Shipping'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const PendingApproval = lazy(() => import('@/pages/PendingApproval'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const DesignerLayout = lazy(() => import('@/layouts/DesignerLayout'));

// Pages load on demand so shoppers don't download admin/artist/designer code.
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center" aria-busy="true" aria-label="Loading">
    <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
  </div>
);

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
                <Suspense fallback={<PageLoading />}>
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
                  <Route path="/orders" element={<Orders />} />
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
                </Suspense>
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
