import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess, createOptimisticUpdate } from '@/lib/queryUtils';

export interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  bio?: string;
  website_url?: string;
  social_links?: any;
  brand_colors?: any;
  commission_rate: number;
  total_sales: number;
  total_earnings: number;
  approval_date?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  display_name?: string;
  email?: string;
  user_profiles?: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  };
  user_roles?: Array<{
    role: string;
  }>;
}

// Fetch all artists
async function fetchArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      user_profiles:profiles(id, email, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch user roles separately
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role');

  // Map roles to artists
  const rolesByUser = (userRoles || []).reduce((acc, { user_id, role }) => {
    if (!acc[user_id]) acc[user_id] = [];
    acc[user_id].push({ role });
    return acc;
  }, {} as Record<string, Array<{ role: string }>>);

  return (data || []).map(artist => ({
    ...artist,
    user_roles: rolesByUser[artist.user_id] || [],
    // Add derived properties from user_profiles for compatibility
    avatar_url: artist.user_profiles?.avatar_url,
    display_name: artist.user_profiles?.display_name,
    email: artist.user_profiles?.email
  }));
}

// Fetch pending artists only
async function fetchPendingArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      user_profiles:profiles(id, email, display_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch user roles separately
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role');

  // Map roles to artists
  const rolesByUser = (userRoles || []).reduce((acc, { user_id, role }) => {
    if (!acc[user_id]) acc[user_id] = [];
    acc[user_id].push({ role });
    return acc;
  }, {} as Record<string, Array<{ role: string }>>);

  return (data || []).map(artist => ({
    ...artist,
    user_roles: rolesByUser[artist.user_id] || [],
    // Add derived properties from user_profiles for compatibility
    avatar_url: artist.user_profiles?.avatar_url,
    display_name: artist.user_profiles?.display_name,
    email: artist.user_profiles?.email
  }));
}

// Fetch featured artists
async function fetchFeaturedArtists(limit: number = 6) {
  const { data: artists, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      user_profiles:profiles(id, email, display_name, avatar_url)
    `)
    .eq('status', 'approved')
    .order('total_sales', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Enhance with additional data
  const enhancedArtists = await Promise.all(
    (artists || []).map(async (artist) => {
      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artist.id)
        .eq('status', 'published');

      // Get follower count
      const { count: followerCount } = await supabase
        .from('artist_follows')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artist.id);

      return {
        id: artist.id,
        name: artist.artist_name,
        avatar: artist.user_profiles?.avatar_url || '/placeholder-avatar.png',
        followers: followerCount || 0,
        revenue: Number(artist.total_earnings) || 0,
        products: productCount || 0,
        rating: 4.8, // Mock rating for now
        slug: artist.artist_slug,
      };
    })
  );

  return enhancedArtists;
}

// Artist mutation functions
async function approveArtist(artistId: string): Promise<void> {
  const { error } = await supabase
    .from('artist_profiles')
    .update({ 
      status: 'approved', 
      approval_date: new Date().toISOString() 
    })
    .eq('id', artistId);

  if (error) throw error;
}

async function rejectArtist(artistId: string): Promise<void> {
  const { error } = await supabase
    .from('artist_profiles')
    .update({ status: 'rejected' })
    .eq('id', artistId);

  if (error) throw error;
}

// React Query hooks
export function useArtistsQuery() {
  return useQuery({
    queryKey: queryKeys.artists.list(),
    queryFn: fetchArtists,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePendingArtistsQuery() {
  return useQuery({
    queryKey: queryKeys.artists.pending,
    queryFn: fetchPendingArtists,
    staleTime: 2 * 60 * 1000, // 2 minutes for pending (more frequent updates)
  });
}

export function useFeaturedArtistsQuery(limit?: number) {
  return useQuery({
    queryKey: queryKeys.artists.featured(limit),
    queryFn: () => fetchFeaturedArtists(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes for featured
  });
}

export function useApproveArtistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveArtist,
    onMutate: async (artistId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.artists.all });

      // Optimistically update all artist queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.artists.all },
        (oldData: Artist[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(
            oldData,
            { 
              id: artistId, 
              status: 'approved', 
              approval_date: new Date().toISOString() 
            },
            'update'
          );
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to approve artist');
    },
    onSuccess: () => {
      handleQuerySuccess('Artist approved successfully');
    },
    onSettled: () => {
      // Invalidate and refetch all artist queries
      queryClient.invalidateQueries({ queryKey: queryKeys.artists.all });
    },
  });
}

export function useRejectArtistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectArtist,
    onMutate: async (artistId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.artists.all });

      queryClient.setQueriesData(
        { queryKey: queryKeys.artists.all },
        (oldData: Artist[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(
            oldData,
            { id: artistId, status: 'rejected' },
            'update'
          );
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to reject artist');
    },
    onSuccess: () => {
      handleQuerySuccess('Artist rejected successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.artists.all });
    },
  });
}

// Legacy hook wrappers for backward compatibility
export function useArtists() {
  const { data: artists = [], isLoading: loading, error, refetch } = useArtistsQuery();
  const approveMutation = useApproveArtistMutation();
  const rejectMutation = useRejectArtistMutation();

  return {
    artists,
    loading,
    error: error?.message || null,
    refetch,
    approveArtist: (artistId: string) => approveMutation.mutateAsync(artistId),
    rejectArtist: (artistId: string) => rejectMutation.mutateAsync(artistId),
  };
}

export function usePendingArtists() {
  const { data: pendingArtists = [], isLoading: loading, error, refetch } = usePendingArtistsQuery();

  return {
    pendingArtists,
    loading,
    error: error?.message || null,
    refetch,
  };
}

export function useFeaturedArtists(limit?: number) {
  const { data: featuredArtists = [], isLoading: loading, error, refetch } = useFeaturedArtistsQuery(limit);

  return {
    featuredArtists,
    loading,
    error: error?.message || null,
    refetch,
  };
}