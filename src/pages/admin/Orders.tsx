import React from 'react';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { AdminOrdersOverview } from '@/components/admin/AdminOrdersOverview';

export default function AdminOrders() {
  return (
    <>
      <SEOHelmet 
        title="Admin Orders - MerchDrop"
        description="Manage and monitor all orders across the platform. View order details, update statuses, and track fulfillment."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all orders across the platform
          </p>
        </div>
        <AdminOrdersOverview />
      </div>
    </>
  );
}