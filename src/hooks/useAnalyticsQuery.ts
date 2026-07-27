import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalArtists: number;
  totalProducts: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  topArtists: Array<{ name: string; sales: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

// Percentage change between the last two full calendar months of a series
function monthOverMonthGrowth(monthly: Array<{ month: string; revenue: number }>): number {
  if (monthly.length < 2) return 0;
  const previous = monthly[monthly.length - 2].revenue;
  const current = monthly[monthly.length - 1].revenue;
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Growth in count of rows created in the most recent calendar month vs the one before
function monthOverMonthCountGrowth(createdDates: string[]): number {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let thisMonthCount = 0;
  let lastMonthCount = 0;
  for (const dateStr of createdDates) {
    const date = new Date(dateStr);
    if (date >= thisMonthStart) thisMonthCount++;
    else if (date >= lastMonthStart) lastMonthCount++;
  }

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const [
    { data: orders, error: ordersError },
    { data: profiles, error: usersError },
    { count: artistsCount, error: artistsError },
    { count: productsCount, error: productsError },
    { data: orderItems, error: itemsError },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, status, payment_status, created_at'),
    supabase.from('profiles').select('created_at'),
    supabase.from('artist_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('order_items')
      .select('quantity, total_price, products(title), artist_profiles(artist_name)'),
  ]);

  if (ordersError) throw ordersError;
  if (usersError) throw usersError;
  if (artistsError) throw artistsError;
  if (productsError) throw productsError;
  if (itemsError) throw itemsError;

  const completedOrders = (orders || []).filter(order => order.payment_status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = completedOrders.length;

  const monthlyRevenue = calculateMonthlyRevenue(completedOrders);
  const ordersByStatus = calculateOrdersByStatus(orders || []);
  const { topProducts, topArtists } = calculateTopSellers(orderItems || []);

  return {
    totalRevenue,
    totalOrders,
    totalUsers: (profiles || []).length,
    totalArtists: artistsCount || 0,
    totalProducts: productsCount || 0,
    monthlyRevenue,
    topProducts,
    topArtists,
    ordersByStatus,
    revenueGrowth: monthOverMonthGrowth(monthlyRevenue),
    ordersGrowth: monthOverMonthCountGrowth((orders || []).map(o => o.created_at)),
    usersGrowth: monthOverMonthCountGrowth((profiles || []).map(p => p.created_at)),
  };
}

function calculateMonthlyRevenue(orders: Array<{ payment_status: string; created_at: string; total_amount: number }>): Array<{ month: string; revenue: number }> {
  const monthlyData: Record<string, number> = {};

  orders.forEach(order => {
    const date = new Date(order.created_at);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.total_amount);
  });

  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    result.push({
      month: monthKey,
      revenue: monthlyData[monthKey] || 0
    });
  }

  return result;
}

function calculateOrdersByStatus(orders: Array<{ status: string }>): Array<{ status: string; count: number }> {
  const statusCounts: Record<string, number> = {};

  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
}

interface OrderItemRow {
  quantity: number;
  total_price: number;
  products: { title: string } | null;
  artist_profiles: { artist_name: string } | null;
}

function calculateTopSellers(orderItems: OrderItemRow[]): {
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  topArtists: Array<{ name: string; sales: number; revenue: number }>;
} {
  const productTotals: Record<string, { sales: number; revenue: number }> = {};
  const artistTotals: Record<string, { sales: number; revenue: number }> = {};

  orderItems.forEach(item => {
    const productName = item.products?.title;
    if (productName) {
      const entry = productTotals[productName] || { sales: 0, revenue: 0 };
      entry.sales += item.quantity;
      entry.revenue += Number(item.total_price);
      productTotals[productName] = entry;
    }

    const artistName = item.artist_profiles?.artist_name;
    if (artistName) {
      const entry = artistTotals[artistName] || { sales: 0, revenue: 0 };
      entry.sales += item.quantity;
      entry.revenue += Number(item.total_price);
      artistTotals[artistName] = entry;
    }
  });

  const topProducts = Object.entries(productTotals)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topArtists = Object.entries(artistTotals)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return { topProducts, topArtists };
}

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: fetchAnalytics,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// Legacy hook wrapper for backward compatibility
export function useAnalytics() {
  const { data, isLoading: loading, error, refetch } = useAnalyticsQuery();

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
}
