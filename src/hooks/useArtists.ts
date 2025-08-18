import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_earnings: number;
  approval_date: string | null;
  created_at: string;
  updated_at: string;
  // Profile data
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  // Role data
  role: string;
}

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_profiles')
        .select(`
          *,
          profiles!inner(
            display_name,
            email,
            avatar_url,
            bio,
            website_url
          ),
          user_roles!inner(
            role
          )
        `)
        .eq('user_roles.role', 'artist')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedArtists: Artist[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        artist_name: item.artist_name,
        artist_slug: item.artist_slug,
        status: item.status,
        commission_rate: item.commission_rate,
        total_sales: item.total_sales,
        total_earnings: item.total_earnings,
        approval_date: item.approval_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        display_name: item.profiles?.display_name,
        email: item.profiles?.email,
        avatar_url: item.profiles?.avatar_url,
        bio: item.profiles?.bio,
        website_url: item.profiles?.website_url,
        role: item.user_roles?.role
      }));

      setArtists(formattedArtists);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch artists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('artist_profiles')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString()
        })
        .eq('id', artistId);

      if (error) throw error;

      // Refresh the artists list
      await fetchArtists();
      
      toast({
        title: "Artist Approved",
        description: "Artist has been approved successfully"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to approve artist",
        variant: "destructive"
      });
    }
  };

  const rejectArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('artist_profiles')
        .update({
          status: 'rejected'
        })
        .eq('id', artistId);

      if (error) throw error;

      // Refresh the artists list
      await fetchArtists();
      
      toast({
        title: "Artist Rejected",
        description: "Artist application has been rejected",
        variant: "destructive"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to reject artist",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return {
    artists,
    loading,
    error,
    refetch: fetchArtists,
    approveArtist,
    rejectArtist
  };
}

export function usePendingArtists() {
  const [pendingArtists, setPendingArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_profiles')
        .select(`
          *,
          profiles!inner(
            display_name,
            email,
            avatar_url,
            bio,
            website_url
          ),
          user_roles!inner(
            role
          )
        `)
        .eq('status', 'pending')
        .eq('user_roles.role', 'artist')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedArtists: Artist[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        artist_name: item.artist_name,
        artist_slug: item.artist_slug,
        status: item.status,
        commission_rate: item.commission_rate,
        total_sales: item.total_sales,
        total_earnings: item.total_earnings,
        approval_date: item.approval_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        display_name: item.profiles?.display_name,
        email: item.profiles?.email,
        avatar_url: item.profiles?.avatar_url,
        bio: item.profiles?.bio,
        website_url: item.profiles?.website_url,
        role: item.user_roles?.role
      }));

      setPendingArtists(formattedArtists);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingArtists();
  }, []);

  return {
    pendingArtists,
    loading,
    error,
    refetch: fetchPendingArtists
  };
}