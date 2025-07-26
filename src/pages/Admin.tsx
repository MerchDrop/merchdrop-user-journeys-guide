import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminUserTable from '@/components/admin/AdminUserTable';
import ArtistApprovalCard from '@/components/admin/ArtistApprovalCard';
import AdminProductTable from '@/components/admin/AdminProductTable';
import FulfillmentBoard from '@/components/admin/FulfillmentBoard';
import PlatformSalesReport from '@/components/admin/PlatformSalesReport';
import AdminSettings from '@/components/admin/AdminSettings';

const Admin = () => {
  // TODO: Add role-based access control here
  // const user = useAuth();
  // if (user?.role !== 'admin') {
  //   return <Navigate to="/login" />;
  // }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage platform operations and content</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUserTable />
          </TabsContent>

          <TabsContent value="artists" className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Artist Applications</h2>
              <div className="grid gap-4">
                <ArtistApprovalCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <AdminProductTable />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <FulfillmentBoard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <PlatformSalesReport />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Admin;