import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess } from '@/lib/queryUtils';

export interface Payout {
  id: string;
  artist_id: string;
  amount: number;
  net_amount: number;
  processing_fee: number | null;
  currency: string | null;
  status: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  processed_at: string | null;
}

async function fetchPayouts(artistId?: string): Promise<Payout[]> {
  let query = supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (artistId) {
    query = query.eq('artist_id', artistId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function requestPayout(input: {
  artistId: string;
  amount: number;
  paymentMethod: string;
}): Promise<Payout> {
  const processingFee = Math.round(input.amount * 0.025 * 100) / 100;

  const { data, error } = await supabase
    .from('payouts')
    .insert({
      artist_id: input.artistId,
      amount: input.amount,
      net_amount: input.amount - processingFee,
      processing_fee: processingFee,
      payment_method: input.paymentMethod,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function cancelPayout(payoutId: string): Promise<void> {
  const { error } = await supabase
    .from('payouts')
    .delete()
    .eq('id', payoutId)
    .eq('status', 'pending');

  if (error) throw error;
}

export function usePayoutsQuery(artistId?: string) {
  return useQuery({
    queryKey: queryKeys.payouts.list(artistId),
    queryFn: () => fetchPayouts(artistId),
    enabled: artistId !== undefined,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRequestPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestPayout,
    onError: (error) => {
      handleQueryError(error, 'Failed to request payout');
    },
    onSuccess: () => {
      handleQuerySuccess('Payout requested successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useCancelPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayout,
    onError: (error) => {
      handleQueryError(error, 'Failed to cancel payout');
    },
    onSuccess: () => {
      handleQuerySuccess('Payout request cancelled');
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}
