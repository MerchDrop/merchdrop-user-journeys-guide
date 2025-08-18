import React from 'react';
import { ArtistOverview } from '@/components/admin/ArtistOverview';
import { ArtistApprovalCard } from '@/components/admin/ArtistApprovalCard';
import { AdminArtistTable } from '@/components/admin/AdminArtistTable';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function AdminArtists() {
  return (
    <>
      <SEOHelmet 
        title="Artist Management - Admin Dashboard"
        description="Review and approve artist applications from the admin dashboard."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artist Management</h1>
          <p className="text-muted-foreground">
            Review pending artist applications and manage artist approvals.
          </p>
        </div>
        
        <ArtistOverview />
        
        <ArtistApprovalCard />
        
        <AdminArtistTable />
      </div>
    </>
  );
}