import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_provider: string;
  payment_reference: string | null;
  tracking_number: string | null;
  currency: string;
  shipping_address: any;
  billing_address: any | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items?: OrderItem[];
  profiles?: {
    display_name: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  artist_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_variant: any;
  created_at: string;
  products?: {
    title: string;
    main_image_url: string;
    artist_profiles?: {
      artist_name: string;
    };
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isArtist } = useAuth();

  // Auto-fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const fetchOrders = async (filters?: {
    status?: string;
    artistId?: string;
    userId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              title,
              main_image_url,
              artist_profiles (
                artist_name
              )
            )
          ),
          profiles (
            display_name,
            email
          )
        `);

      // Apply filters based on user role
      if (isArtist && filters?.artistId) {
        // Artist viewing their own orders - need to join with order_items
        query = query.filter('order_items.artist_id', 'eq', filters.artistId);
      } else if (!isArtist && user?.id) {
        // Regular user viewing their own orders
        query = query.eq('user_id', user.id);
      }

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        // Check if this is a schema access error
        if (supabaseError.message?.includes('schema must be one of the following')) {
          console.warn('Schema access restricted for orders, using empty data');
          setOrders([]);
          return;
        }
        throw supabaseError;
      }

      setOrders((data || []) as Order[]);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string) => {
    try {
      setError(null);

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'shipped' && trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        throw updateError;
      }

      // Refresh orders
      await fetchOrders();

      return { error: null };
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status'], paymentReference?: string) => {
    try {
      setError(null);

      const updateData: any = { 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentReference) {
        updateData.payment_reference = paymentReference;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        throw updateError;
      }

      // Refresh orders
      await fetchOrders();

      return { error: null };
    } catch (err) {
      console.error('Error updating payment status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
  };
}