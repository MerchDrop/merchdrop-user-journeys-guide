import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AdminUserTable from '@/components/admin/AdminUserTable';
import ArtistApprovalCard from '@/components/admin/ArtistApprovalCard';
import AdminProductTable from '@/components/admin/AdminProductTable';
import FulfillmentBoard from '@/components/admin/FulfillmentBoard';
import PlatformSalesReport from '@/components/admin/PlatformSalesReport';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminOverview from '@/components/admin/AdminOverview';
import SEOHelmet from '@/components/SEO/SEOHelmet';

const Admin = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  // TODO: Add role-based access control here
  // const user = useAuth();
  // if (user?.role !== 'admin') {
  //   return <Navigate to="/login" />;
  // }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUserTable />;
      case 'artists':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Artist Applications</h2>
            <div className="grid gap-4">
              <ArtistApprovalCard />
            </div>
          </div>
        );
      case 'products':
        return <AdminProductTable />;
      case 'orders':
        return <FulfillmentBoard />;
      case 'reports':
        return <PlatformSalesReport />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout>
      <SEOHelmet 
        title="Admin Dashboard - Platform Management | MerchDrop"
        description="Comprehensive admin dashboard for managing users, artists, products, and platform operations."
        keywords="admin dashboard, platform management, user management, analytics"
      />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform operations and monitor performance</p>
        </div>

        <div className="space-y-4">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;