import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ArtistOrderItem {
  product_id: string | null;
  title: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant: { size?: string | null; color?: string | null } | null;
}

export interface ArtistOrder {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ArtistOrderItem[];
}

/** The signed-in artist's paid orders, limited to their own items (see artist_orders() in the DB). */
export function useArtistOrders() {
  return useQuery({
    queryKey: ['artist-orders'],
    queryFn: async (): Promise<ArtistOrder[]> => {
      const { data, error } = await supabase.rpc('artist_orders');
      if (error) throw error;
      return (data as unknown as ArtistOrder[]) ?? [];
    },
    staleTime: 60_000,
  });
}

/** Refunded/cancelled orders don't count as sales. */
export const countsAsSale = (o: Pick<ArtistOrder, 'status'>) => !['refunded', 'cancelled'].includes(o.status);
