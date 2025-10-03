import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { DesignGallery } from '@/components/artist/DesignGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function ArtistDesigns() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');

  const { data: artistProfile } = useQuery({
    queryKey: ['artist-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: approvedDesigns, isLoading: approvedLoading } = useQuery({
    queryKey: ['approved-designs', artistProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designs')
        .select(`
          *,
          designer:designer_profiles(id, designer_name)
        `)
        .eq('artist_id', artistProfile?.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!artistProfile?.id,
  });

  const { data: mySelections, isLoading: selectionsLoading } = useQuery({
    queryKey: ['my-design-selections', artistProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_design_selections')
        .select(`
          *,
          design:designs(
            id,
            title,
            description,
            file_urls,
            designer:designer_profiles(designer_name)
          )
        `)
        .eq('artist_id', artistProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!artistProfile?.id,
  });

  // Filter out designs that have already been selected
  const selectedDesignIds = mySelections?.map(s => s.design_id) || [];
  const availableDesigns = approvedDesigns?.filter(
    d => !selectedDesignIds.includes(d.id)
  ) || [];

  return (
    <>
      <SEOHelmet 
        title="Browse Designs - Artist Dashboard"
        description="Browse and select designs from designers to add to your merchandise collection."
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Designs</h1>
          <p className="text-muted-foreground">
            Select approved designs from designers to add to your merchandise.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="available">
              Available Designs ({availableDesigns.length})
            </TabsTrigger>
            <TabsTrigger value="selected">
              My Selections ({mySelections?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {approvedLoading ? (
              <p>Loading designs...</p>
            ) : availableDesigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No designs available yet</p>
              </div>
            ) : (
              <DesignGallery 
                designs={availableDesigns} 
                artistId={artistProfile?.id}
              />
            )}
          </TabsContent>

          <TabsContent value="selected">
            {selectionsLoading ? (
              <p>Loading selections...</p>
            ) : !mySelections || mySelections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't selected any designs yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySelections.map((selection) => (
                  <div key={selection.id} className="border rounded-lg p-4 space-y-3">
                    {selection.design?.file_urls[0] && (
                      <img
                        src={selection.design.file_urls[0]}
                        alt={selection.design.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{selection.design?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {selection.design?.designer?.designer_name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm capitalize">{selection.status}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selection.admin_feedback && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <p className="font-medium">Feedback:</p>
                        <p className="text-muted-foreground">{selection.admin_feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
