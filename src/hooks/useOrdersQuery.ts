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

// Create new order
async function createOrder(orderData: {
  subtotal: number;
  shipping_cost?: number;
  tax_amount?: number;
  total_amount: number;
  currency?: string;
  shipping_address: any;
  billing_address?: any;
  items: Array<{
    product_id: string;
    artist_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variant?: any;
  }>;
}): Promise<Order> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shipping_cost || 0,
      tax_amount: orderData.tax_amount || 0,
      total_amount: orderData.total_amount,
      currency: orderData.currency || 'USD',
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = orderData.items.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

// Update order status
async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<void> {
  const updateData: any = { status };

  if (status === 'shipped' && trackingNumber) {
    updateData.tracking_number = trackingNumber;
    updateData.shipped_at = new Date().toISOString();
  } else if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;
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

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onError: (error) => {
      handleQueryError(error, 'Failed to create order');
    },
    onSuccess: (newOrder) => {
      handleQuerySuccess('Order created successfully');
      // Invalidate orders queries
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, trackingNumber }: {
      orderId: string;
      status: string;
      trackingNumber?: string;
    }) => updateOrderStatus(orderId, status, trackingNumber),
    onMutate: async ({ orderId, status, trackingNumber }) => {
      // Optimistically update all order queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.all },
        (oldData: Order[] | undefined) => {
          if (!oldData) return oldData;
          
          const updateData: any = { id: orderId, status };
          if (status === 'shipped' && trackingNumber) {
            updateData.tracking_number = trackingNumber;
            updateData.shipped_at = new Date().toISOString();
          } else if (status === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
          }

          return createOptimisticUpdate(oldData, updateData, 'update');
        }
      );
    },
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
  const createOrderMutation = useCreateOrderMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentStatusMutation = useUpdatePaymentStatusMutation();

  return {
    orders,
    loading,
    error: error?.message || null,
    fetchOrders: () => {}, // No longer needed
    createOrder: (orderData: any) => createOrderMutation.mutateAsync(orderData),
    updateOrderStatus: (orderId: string, status: string, trackingNumber?: string) =>
      updateOrderStatusMutation.mutateAsync({ orderId, status, trackingNumber }),
    updatePaymentStatus: (orderId: string, paymentStatus: string, paymentReference?: string) =>
      updatePaymentStatusMutation.mutateAsync({ orderId, paymentStatus, paymentReference }),
  };
}