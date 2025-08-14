import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArtistDashboard } from '@/components/artist/ArtistDashboard';

export default function ArtistAnalytics() {
  return (
    <DashboardLayout>
      <ArtistDashboard />
    </DashboardLayout>
  );
}