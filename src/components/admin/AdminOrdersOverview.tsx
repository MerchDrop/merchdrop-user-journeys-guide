import React from 'react';
import { AdminOrdersTable } from './AdminOrdersTable';
import { AdminOrdersStats } from './AdminOrdersStats';

export function AdminOrdersOverview() {
  return (
    <div className="space-y-6">
      <AdminOrdersStats />
      <AdminOrdersTable />
    </div>
  );
}