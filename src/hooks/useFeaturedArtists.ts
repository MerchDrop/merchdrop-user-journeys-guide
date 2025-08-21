import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeaturedArtist {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  revenue: number;
  products: number;
  rating: number;
  slug: string;
}

export function useFeaturedArtists(limit: number = 6) {
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeaturedArtists = async () => {
    try {
      setLoading(true);
      
      // Fetch approved artists with their profile data and product count
      const { data: artistData, error: artistError } = await supabase
        .from('artist_profiles')
        .select(`
          id,
          artist_name,
          artist_slug,
          total_sales,
          total_earnings,
          profiles!inner(
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('total_sales', { ascending: false })
        .limit(limit);

      if (artistError) throw artistError;

      // For each artist, get their product count and follower count
      const artistsWithMetrics = await Promise.all(
        (artistData || []).map(async (artist) => {
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

          // Calculate average rating (placeholder - would need reviews table)
          const rating = 4.5 + Math.random() * 0.5; // Mock rating for now

          return {
            id: artist.id,
            name: artist.artist_name || artist.profiles?.display_name || 'Anonymous Artist',
            avatar: artist.profiles?.avatar_url || '/placeholder.svg',
            followers: followerCount || 0,
            revenue: Number(artist.total_earnings || 0),
            products: productCount || 0,
            rating: Math.round(rating * 10) / 10,
            slug: artist.artist_slug
          };
        })
      );

      setFeaturedArtists(artistsWithMetrics);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching featured artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedArtists();
  }, [limit]);

  return {
    featuredArtists,
    loading,
    error,
    refetch: fetchFeaturedArtists
  };
}