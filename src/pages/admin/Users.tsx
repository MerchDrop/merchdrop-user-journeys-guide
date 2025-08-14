import React from 'react';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function AdminUsers() {
  return (
    <>
      <SEOHelmet 
        title="User Management - Admin Dashboard"
        description="Manage user accounts, roles and permissions from the admin dashboard."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions across the platform.
          </p>
        </div>
        
        <AdminUserTable />
      </div>
    </>
  );
}