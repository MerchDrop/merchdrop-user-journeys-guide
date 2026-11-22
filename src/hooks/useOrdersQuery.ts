import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess, createOptimisticUpdate } from '@/lib/queryUtils';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  artist_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_variant?: any;
  created_at: string;
  products?: {
    id: string;
    title: string;
    main_image_url?: string;
  };
  artist_profiles?: {
    id: string;
    artist_name: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_provider?: string;
  payment_reference?: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address?: any;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profiles?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

interface OrderFilters {
  status?: string;
  artistId?: string;
  userId?: string;
  paymentStatus?: string;
}

// Fetch orders with filters
async function fetchOrders(filters: OrderFilters = {}): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      profiles(id, email, display_name),
      order_items(
        *,
        products(id, title, main_image_url),
        artist_profiles(id, artist_name)
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  const { data, error } = await query;
  if (error) throw error;

  let orders = data || [];

  // Filter by artist if specified
  if (filters.artistId) {
    orders = orders.filter(order =>
      order.order_items?.some(item => item.artist_id === filters.artistId)
    );
  }

  return orders;
}
// Update order status (admin). Goes through the update-order-status edge function, which
// validates the move, logs it with the admin's name, and emails the customer when appropriate.
async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string,
  carrierName?: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('update-order-status', {
    body: { orderId, status, trackingNumber, carrierName },
  });
  if (error || data?.error) {
    let message = data?.error;
    try { message ??= (await (error as any)?.context?.json?.())?.error; } catch { /* non-JSON error body */ }
    throw new Error(message || 'Could not update the order');
  }
}

// Update payment status
async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentReference?: string
): Promise<void> {
  const updateData: any = { payment_status: paymentStatus };

  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;
}

// React Query hooks
export function useOrdersQuery(filters?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => fetchOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, trackingNumber, carrierName }: {
      orderId: string;
      status: string;
      trackingNumber?: string;
      carrierName?: string;
    }) => updateOrderStatus(orderId, status, trackingNumber, carrierName),
    onError: (error) => {
      handleQueryError(error, 'Failed to update order status');
    },
    onSuccess: () => {
      handleQuerySuccess('Order status updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useUpdatePaymentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus, paymentReference }: {
      orderId: string;
      paymentStatus: string;
      paymentReference?: string;
    }) => updatePaymentStatus(orderId, paymentStatus, paymentReference),
    onMutate: async ({ orderId, paymentStatus, paymentReference }) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.all },
        (oldData: Order[] | undefined) => {
          if (!oldData) return oldData;
          
          const updateData: any = { id: orderId, payment_status: paymentStatus };
          if (paymentReference) {
            updateData.payment_reference = paymentReference;
          }

          return createOptimisticUpdate(oldData, updateData, 'update');
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to update payment status');
    },
    onSuccess: () => {
      handleQuerySuccess('Payment status updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

// Legacy hook wrapper for backward compatibility
export function useOrders() {
  const { data: orders = [], isLoading: loading, error } = useOrdersQuery();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentStatusMutation = useUpdatePaymentStatusMutation();

  return {
    orders,
    loading,
    error: error?.message || null,
    fetchOrders: () => {}, // No longer needed
    updateOrderStatus: (orderId: string, status: string, trackingNumber?: string, carrierName?: string) =>
      updateOrderStatusMutation.mutateAsync({ orderId, status, trackingNumber, carrierName }),
    updatePaymentStatus: (orderId: string, paymentStatus: string, paymentReference?: string) =>
      updatePaymentStatusMutation.mutateAsync({ orderId, paymentStatus, paymentReference }),
  };
}