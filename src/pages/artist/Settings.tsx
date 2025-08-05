import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProfileSettings from '@/components/artist/ProfileSettings';

export default function ArtistSettings() {
  return (
    <DashboardLayout>
      <ProfileSettings />
    </DashboardLayout>
  );
}