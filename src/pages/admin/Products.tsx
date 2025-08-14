import React from 'react';
import { AdminProductTable } from '@/components/admin/AdminProductTable';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function AdminProducts() {
  return (
    <>
      <SEOHelmet 
        title="Product Management - Admin Dashboard"
        description="Manage products, status, inventory and pricing from the admin dashboard."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">
            Manage product status, inventory, and pricing across the platform.
          </p>
        </div>
        
        <AdminProductTable />
      </div>
    </>
  );
}