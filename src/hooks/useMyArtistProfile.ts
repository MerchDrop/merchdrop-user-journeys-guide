import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';

export interface ArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  commission_rate: number | null;
}

async function fetchMyArtistProfile(userId: string): Promise<ArtistProfile | null> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id, user_id, artist_name, artist_slug, status, commission_rate')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Resolves the artist_profiles row for the signed-in user — needed to scope
// orders/products/payouts/analytics queries to "my" data on artist dashboard pages.
export function useMyArtistProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.myArtistProfile(user?.id ?? ''),
    queryFn: () => fetchMyArtistProfile(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
