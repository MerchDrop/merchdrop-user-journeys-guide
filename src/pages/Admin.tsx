import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';

export default function Admin() {
  return (
    <AdminLayout>
      <AdminOverview />
    </AdminLayout>
  );
}