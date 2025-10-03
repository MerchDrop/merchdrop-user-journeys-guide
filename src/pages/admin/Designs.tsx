import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignApprovalCard } from '@/components/admin/DesignApprovalCard';
import { ProductDesignApprovalCard } from '@/components/admin/ProductDesignApprovalCard';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { toast } from 'sonner';

export default function AdminDesigns() {
  const [activeTab, setActiveTab] = useState('designs');
  const queryClient = useQueryClient();

  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ['admin-designs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designs')
        .select(`
          *,
          designer:designer_profiles(id, designer_name, user_id),
          artist:artist_profiles(id, artist_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: selections, isLoading: selectionsLoading } = useQuery({
    queryKey: ['admin-design-selections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_design_selections')
        .select(`
          *,
          design:designs(id, title, file_urls),
          artist:artist_profiles(id, artist_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveDesign = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('designs')
        .update({
          status: 'approved',
          admin_feedback: feedback,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
      toast.success('Design approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve design');
    },
  });

  const rejectDesign = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      const { error } = await supabase
        .from('designs')
        .update({
          status: 'declined',
          admin_feedback: feedback,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
      toast.success('Design rejected');
    },
    onError: () => {
      toast.error('Failed to reject design');
    },
  });

  const pendingDesigns = designs?.filter(d => d.status === 'pending') || [];
  const approvedDesigns = designs?.filter(d => d.status === 'approved') || [];
  const declinedDesigns = designs?.filter(d => d.status === 'declined') || [];

  return (
    <>
      <SEOHelmet 
        title="Design Management - Admin Dashboard"
        description="Review and approve designs submitted by designers for artists."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Design Management</h1>
          <p className="text-muted-foreground">
            Review designer submissions and artist product selections.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="designs">Designer Submissions</TabsTrigger>
            <TabsTrigger value="selections">Artist Selections</TabsTrigger>
          </TabsList>

          <TabsContent value="designs" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Designs ({pendingDesigns.length})</h2>
              {designsLoading ? (
                <p>Loading...</p>
              ) : pendingDesigns.length === 0 ? (
                <p className="text-muted-foreground">No pending designs</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingDesigns.map((design) => (
                    <DesignApprovalCard
                      key={design.id}
                      design={design}
                      onApprove={(feedback) => approveDesign.mutate({ id: design.id, feedback })}
                      onReject={(feedback) => rejectDesign.mutate({ id: design.id, feedback })}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Approved Designs ({approvedDesigns.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvedDesigns.map((design) => (
                  <DesignApprovalCard key={design.id} design={design} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Declined Designs ({declinedDesigns.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {declinedDesigns.map((design) => (
                  <DesignApprovalCard key={design.id} design={design} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="selections" className="space-y-6">
            {selectionsLoading ? (
              <p>Loading...</p>
            ) : !selections || selections.length === 0 ? (
              <p className="text-muted-foreground">No product selections</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selections.map((selection) => (
                  <ProductDesignApprovalCard
                    key={selection.id}
                    selection={selection}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
