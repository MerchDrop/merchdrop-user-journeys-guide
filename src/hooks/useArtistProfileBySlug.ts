import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ArtistPublicProfile {
  id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  total_sales: number;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  social_links: { instagram?: string; spotify?: string; tiktok?: string; twitter?: string; youtube?: string } | null;
  followerCount: number;
  averageRating: number | null;
  reviewCount: number;
}

async function fetchArtistProfileBySlug(slug: string): Promise<ArtistPublicProfile | null> {
  const { data: artist, error } = await supabase
    .from('artist_profiles')
    .select('id, user_id, artist_name, artist_slug, status, total_sales')
    .eq('artist_slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!artist) return null;

  // Bio/avatar live on `profiles`, not `artist_profiles` — no FK embed exists
  // between the two tables, so this is queried separately and merged here.
  const [{ data: profile }, { count: followerCount }, { data: reviewRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('bio, avatar_url, website_url, social_links')
      .eq('id', artist.user_id)
      .maybeSingle(),
    supabase
      .from('artist_follows')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artist.id),
    supabase
      .from('reviews')
      .select('rating, products!inner(artist_id)')
      .eq('products.artist_id', artist.id),
  ]);

  const ratings = (reviewRows || []).map(r => r.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : null;

  return {
    id: artist.id,
    artist_name: artist.artist_name,
    artist_slug: artist.artist_slug,
    status: artist.status,
    total_sales: artist.total_sales || 0,
    bio: profile?.bio ?? null,
    avatar_url: profile?.avatar_url ?? null,
    website_url: profile?.website_url ?? null,
    social_links: (profile?.social_links as ArtistPublicProfile['social_links']) ?? null,
    followerCount: followerCount || 0,
    averageRating,
    reviewCount: ratings.length,
  };
}

export function useArtistProfileBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['artistProfileBySlug', slug],
    queryFn: () => fetchArtistProfileBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
