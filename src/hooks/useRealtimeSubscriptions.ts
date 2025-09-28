import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook to manage real-time subscriptions for React Query
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders change:', payload);
          // Invalidate orders queries
          queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        }
      )
      .subscribe();

    // Subscribe to products changes
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Products change:', payload);
          // Invalidate products queries
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        }
      )
      .subscribe();

    // Subscribe to user_roles changes
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('User roles change:', payload);
          // Invalidate users queries
          queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        }
      )
      .subscribe();

    // Subscribe to artist_profiles changes
    const artistsChannel = supabase
      .channel('artists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_profiles'
        },
        (payload) => {
          console.log('Artists change:', payload);
          // Invalidate artists queries
          queryClient.invalidateQueries({ queryKey: queryKeys.artists.all });
        }
      )
      .subscribe();

    // Subscribe to designs changes
    const designsChannel = supabase
      .channel('designs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'designs'
        },
        (payload) => {
          console.log('Designs change:', payload);
          // Invalidate designers queries
          queryClient.invalidateQueries({ queryKey: queryKeys.designers.all });
        }
      )
      .subscribe();

    // Store channels for cleanup
    channelsRef.current = [
      ordersChannel,
      productsChannel,
      userRolesChannel,
      artistsChannel,
      designsChannel
    ];

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [queryClient]);

  return null; // This hook doesn't return anything, it just manages subscriptions
}

// Hook for specific entity subscriptions
export function useEntitySubscription(
  table: string,
  filter?: { column: string; value: string },
  queryKey?: readonly unknown[]
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let channelConfig: any = {
      event: '*',
      schema: 'public',
      table
    };

    if (filter) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`;
    }

    const channel = supabase
      .channel(`${table}-${filter?.value || 'all'}-changes`)
      .on('postgres_changes', channelConfig, (payload) => {
        console.log(`${table} change:`, payload);
        
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        } else {
          // Invalidate all queries for this table
          queryClient.invalidateQueries({ 
            predicate: (query) => 
              Array.isArray(query.queryKey) && 
              query.queryKey.some(key => 
                typeof key === 'string' && key.includes(table)
              )
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter?.column, filter?.value, queryKey, queryClient]);

  return null;
}