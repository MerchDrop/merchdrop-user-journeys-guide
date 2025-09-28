import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess } from '@/lib/queryUtils';

export interface DesignerProfile {
  id: string;
  user_id: string;
  designer_name: string;
  bio?: string;
  status: string;
  total_designs: number;
  approved_designs: number;
  pending_designs: number;
  declined_designs: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  designer_id: string;
  artist_id: string;
  title: string;
  description?: string;
  file_urls: string[];
  status: string;
  admin_feedback?: string;
  approved_by?: string;
  approved_at?: string;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
  artist_profiles?: {
    id: string;
    artist_name: string;
    artist_slug: string;
  };
}

export interface DesignerPayout {
  id: string;
  designer_id: string;
  amount: number;
  processing_fee: number;
  net_amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Fetch designer profile for current user
async function fetchDesignerProfile(): Promise<DesignerProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('designer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
  return data;
}

// Fetch designs for current designer
async function fetchDesigns(): Promise<Design[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // First get designer profile
  const { data: profile } = await supabase
    .from('designer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return [];

  const { data, error } = await supabase
    .from('designs')
    .select(`
      *,
      artist_profiles(id, artist_name, artist_slug)
    `)
    .eq('designer_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch payouts for current designer
async function fetchPayouts(): Promise<DesignerPayout[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // First get designer profile
  const { data: profile } = await supabase
    .from('designer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return [];

  const { data, error } = await supabase
    .from('designer_payouts')
    .select('*')
    .eq('designer_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create designer profile
async function createDesignerProfile(designerName: string, bio?: string): Promise<DesignerProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('designer_profiles')
    .insert({
      user_id: user.id,
      designer_name: designerName,
      bio,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Upload design
async function uploadDesign(designData: {
  artist_id: string;
  title: string;
  description?: string;
  file_urls: string[];
}): Promise<Design> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get designer profile
  const { data: profile } = await supabase
    .from('designer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Designer profile not found');

  const { data, error } = await supabase
    .from('designs')
    .insert({
      designer_id: profile.id,
      artist_id: designData.artist_id,
      title: designData.title,
      description: designData.description,
      file_urls: designData.file_urls,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update designer profile
async function updateDesignerProfile(updates: Partial<DesignerProfile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('designer_profiles')
    .update(updates)
    .eq('user_id', user.id);

  if (error) throw error;
}

// React Query hooks
export function useDesignerProfileQuery() {
  return useQuery({
    queryKey: queryKeys.designers.profile('current'),
    queryFn: fetchDesignerProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDesignsQuery() {
  return useQuery({
    queryKey: queryKeys.designers.designs('current'),
    queryFn: fetchDesigns,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDesignerPayoutsQuery() {
  return useQuery({
    queryKey: queryKeys.designers.payouts('current'),
    queryFn: fetchPayouts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateDesignerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ designerName, bio }: { designerName: string; bio?: string }) =>
      createDesignerProfile(designerName, bio),
    onError: (error) => {
      handleQueryError(error, 'Failed to create designer profile');
    },
    onSuccess: () => {
      handleQuerySuccess('Designer profile created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.designers.all });
    },
  });
}

export function useUploadDesignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDesign,
    onError: (error) => {
      handleQueryError(error, 'Failed to upload design');
    },
    onSuccess: () => {
      handleQuerySuccess('Design uploaded successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.designers.designs('current') });
    },
  });
}

export function useUpdateDesignerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDesignerProfile,
    onError: (error) => {
      handleQueryError(error, 'Failed to update designer profile');
    },
    onSuccess: () => {
      handleQuerySuccess('Designer profile updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.designers.profile('current') });
    },
  });
}

// Legacy hook wrapper for backward compatibility
export function useDesigners() {
  const { data: designerProfile, isLoading: profileLoading } = useDesignerProfileQuery();
  const { data: designs = [], isLoading: designsLoading } = useDesignsQuery();
  const { data: payouts = [], isLoading: payoutsLoading } = useDesignerPayoutsQuery();
  
  const createProfileMutation = useCreateDesignerProfileMutation();
  const uploadDesignMutation = useUploadDesignMutation();
  const updateProfileMutation = useUpdateDesignerProfileMutation();

  const loading = profileLoading || designsLoading || payoutsLoading;

  return {
    designerProfile,
    designs,
    payouts,
    loading,
    error: null,
    fetchDesignerProfile: () => {}, // No longer needed
    fetchDesigns: () => {}, // No longer needed
    fetchPayouts: () => {}, // No longer needed
    createDesignerProfile: (designerName: string, bio?: string) =>
      createProfileMutation.mutateAsync({ designerName, bio }),
    uploadDesign: (designData: any) => uploadDesignMutation.mutateAsync(designData),
    updateDesignerProfile: (updates: any) => updateProfileMutation.mutateAsync(updates),
  };
}