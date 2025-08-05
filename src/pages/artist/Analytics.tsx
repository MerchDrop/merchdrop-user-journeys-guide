import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AnalyticsOverview from '@/components/artist/AnalyticsOverview';

export default function ArtistAnalytics() {
  return (
    <DashboardLayout>
      <AnalyticsOverview />
    </DashboardLayout>
  );
}