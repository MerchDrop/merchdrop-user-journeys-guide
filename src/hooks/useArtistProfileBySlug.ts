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
  const { data: a, error } = await supabase
    .from('public_artist_profiles' as never)
    .select('*')
    .eq('artist_slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!a) return null;
  const artist = a as Record<string, any>;

  return {
    id: artist.id,
    artist_name: artist.artist_name,
    artist_slug: artist.artist_slug,
    status: 'approved',
    total_sales: Number(artist.total_sales) || 0,
    bio: artist.bio ?? null,
    avatar_url: artist.avatar_url ?? null,
    website_url: artist.website_url ?? null,
    social_links: artist.social_links ?? null,
    followerCount: artist.follower_count ?? 0,
    averageRating: artist.average_rating == null ? null : Number(artist.average_rating),
    reviewCount: artist.review_count ?? 0,
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
