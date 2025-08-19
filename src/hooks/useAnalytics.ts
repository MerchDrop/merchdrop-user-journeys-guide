import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalArtists: number;
  totalProducts: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ id: string; title: string; revenue: number; orders: number }>;
  topArtists: Array<{ id: string; name: string; revenue: number; orders: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total metrics
      const [
        ordersResponse,
        usersResponse,
        artistsResponse,
        productsResponse,
      ] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('artist_profiles').select('id, created_at'),
        supabase.from('products').select('id, title, price_cents, created_at'),
      ]);

      if (ordersResponse.error) throw ordersResponse.error;
      if (usersResponse.error) throw usersResponse.error;
      if (artistsResponse.error) throw artistsResponse.error;
      if (productsResponse.error) throw productsResponse.error;

      const orders = ordersResponse.data || [];
      const users = usersResponse.data || [];
      const artists = artistsResponse.data || [];
      const products = productsResponse.data || [];

      // Calculate total revenue from completed orders
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Calculate monthly revenue for the last 12 months
      const monthlyRevenue = calculateMonthlyRevenue(orders);

      // Get order status distribution
      const ordersByStatus = calculateOrdersByStatus(orders);

      // Calculate growth metrics (compare last 30 days with previous 30 days)
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = orders.filter(o => new Date(o.created_at) >= last30Days);
      const previousOrders = orders.filter(o => 
        new Date(o.created_at) >= previous30Days && new Date(o.created_at) < last30Days
      );

      const recentUsers = users.filter(u => new Date(u.created_at) >= last30Days);
      const previousUsers = users.filter(u => 
        new Date(u.created_at) >= previous30Days && new Date(u.created_at) < last30Days
      );

      const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;
      const usersGrowth = previousUsers.length > 0 ? ((recentUsers.length - previousUsers.length) / previousUsers.length) * 100 : 0;

      setData({
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalArtists: artists.length,
        totalProducts: products.length,
        monthlyRevenue,
        topProducts: [], // Will implement with proper product analytics
        topArtists: [], // Will implement with proper artist analytics
        ordersByStatus,
        revenueGrowth,
        ordersGrowth,
        usersGrowth,
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    // Aggregate revenue by month
    orders
      .filter(order => order.status === 'completed')
      .forEach(order => {
        const orderDate = new Date(order.created_at);
        const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += order.total_amount || 0;
        }
      });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  };

  const calculateOrdersByStatus = (orders: any[]) => {
    const statusCounts: { [key: string]: number } = {};
    orders.forEach(order => {
      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  };

  return { data, loading, error, refetch: fetchAnalytics };
};