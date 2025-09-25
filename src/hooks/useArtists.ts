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
      
      // First get all artist profiles
      const { data: artistProfiles, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (artistError) throw artistError;

      if (!artistProfiles || artistProfiles.length === 0) {
        setArtists([]);
        return;
      }

      // Get user IDs
      const userIds = artistProfiles.map(ap => ap.user_id);

      // Get profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, bio, website_url')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Get user roles for these users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'artist');

      if (rolesError) throw rolesError;

      // Combine the data
      const formattedArtists: Artist[] = artistProfiles
        .filter(ap => userRoles?.some(ur => ur.user_id === ap.user_id))
        .map((ap: any) => {
          const profile = profiles?.find(p => p.id === ap.user_id);
          const role = userRoles?.find(ur => ur.user_id === ap.user_id);
          
          return {
            id: ap.id,
            user_id: ap.user_id,
            artist_name: ap.artist_name,
            artist_slug: ap.artist_slug,
            status: ap.status,
            commission_rate: ap.commission_rate,
            total_sales: ap.total_sales,
            total_earnings: ap.total_earnings,
            approval_date: ap.approval_date,
            created_at: ap.created_at,
            updated_at: ap.updated_at,
            display_name: profile?.display_name || null,
            email: profile?.email || null,
            avatar_url: profile?.avatar_url || null,
            bio: profile?.bio || null,
            website_url: profile?.website_url || null,
            role: role?.role || 'artist'
          };
        });

      setArtists(formattedArtists);
    } catch (err: any) {
      console.error('Error fetching artists:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch artists: " + err.message,
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
      
      // Get pending artist profiles
      const { data: artistProfiles, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (artistError) throw artistError;

      if (!artistProfiles || artistProfiles.length === 0) {
        setPendingArtists([]);
        return;
      }

      // Get user IDs
      const userIds = artistProfiles.map(ap => ap.user_id);

      // Get profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, bio, website_url')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Get user roles for these users (must have artist role)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'artist');

      if (rolesError) throw rolesError;

      // Combine the data
      const formattedArtists: Artist[] = artistProfiles
        .filter(ap => userRoles?.some(ur => ur.user_id === ap.user_id))
        .map((ap: any) => {
          const profile = profiles?.find(p => p.id === ap.user_id);
          const role = userRoles?.find(ur => ur.user_id === ap.user_id);
          
          return {
            id: ap.id,
            user_id: ap.user_id,
            artist_name: ap.artist_name,
            artist_slug: ap.artist_slug,
            status: ap.status,
            commission_rate: ap.commission_rate,
            total_sales: ap.total_sales,
            total_earnings: ap.total_earnings,
            approval_date: ap.approval_date,
            created_at: ap.created_at,
            updated_at: ap.updated_at,
            display_name: profile?.display_name || null,
            email: profile?.email || null,
            avatar_url: profile?.avatar_url || null,
            bio: profile?.bio || null,
            website_url: profile?.website_url || null,
            role: role?.role || 'artist'
          };
        });

      setPendingArtists(formattedArtists);
    } catch (err: any) {
      console.error('Error fetching pending artists:', err);
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