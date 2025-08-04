import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProfileSettings from '@/components/artist/ProfileSettings';

export default function Settings() {
  return (
    <DashboardLayout>
      <ProfileSettings />
    </DashboardLayout>
  );
}