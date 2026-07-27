import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import KpiCard from '@/components/dashboard/KpiCard';
import SalesChart from '@/components/dashboard/SalesChart';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import PayoutsList from '@/components/dashboard/PayoutsList';
import { CalendarDialog } from '@/components/dialogs/CalendarDialog';
import { useCurrency } from '@/context/CurrencyContext';
import { useMyArtistProfile } from '@/hooks/useMyArtistProfile';
import { useOrdersQuery } from '@/hooks/useOrdersQuery';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { usePayoutsQuery } from '@/hooks/usePayoutsQuery';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Plus,
  BarChart3,
  User
} from 'lucide-react';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function Dashboard() {
  const { user, isArtist, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: artistProfile, isLoading: profileLoading } = useMyArtistProfile();
  const artistId = artistProfile?.id;
  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery({ artistId });
  const { data: products = [], isLoading: productsLoading } = useProductsQuery({ artist: artistId });
  const { data: payouts = [], isLoading: payoutsLoading } = usePayoutsQuery(artistId);

  const loading = authLoading || profileLoading || (!!artistId && (ordersLoading || productsLoading || payoutsLoading));

  const myItems = useMemo(
    () => orders.flatMap(order => (order.order_items || []).filter(item => item.artist_id === artistId)),
    [orders, artistId]
  );

  const totalRevenue = myItems.reduce((sum, item) => sum + Number(item.total_price), 0);
  const ordersForMe = orders.filter(o => (o.order_items || []).some(i => i.artist_id === artistId));
  const uniqueCustomers = new Set(ordersForMe.map(o => o.user_id)).size;

  const kpiData = [
    { title: 'Total Sales', value: formatPrice(totalRevenue), change: '', trend: 'neutral' as const, icon: DollarSign },
    { title: 'Orders', value: ordersForMe.length.toString(), change: '', trend: 'neutral' as const, icon: ShoppingCart },
    { title: 'Products', value: products.length.toString(), change: '', trend: 'neutral' as const, icon: Package },
    { title: 'Customers', value: uniqueCustomers.toString(), change: '', trend: 'neutral' as const, icon: Users },
  ];

  // Revenue per day for the last 30 days
  const salesData = useMemo(() => {
    const byDay: Record<string, number> = {};
    ordersForMe.forEach(order => {
      const dayKey = new Date(order.created_at).toISOString().slice(0, 10);
      const myOrderItems = (order.order_items || []).filter(i => i.artist_id === artistId);
      byDay[dayKey] = (byDay[dayKey] || 0) + myOrderItems.reduce((sum, i) => sum + Number(i.total_price), 0);
    });
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayKey = date.toISOString().slice(0, 10);
      result.push({ date: dayKey, sales: byDay[dayKey] || 0 });
    }
    return result;
  }, [ordersForMe, artistId]);

  // Units sold per product, for the ProductPerformance chart
  const productPerformanceData = useMemo(() => {
    const unitsByProduct: Record<string, number> = {};
    myItems.forEach(item => {
      const title = item.products?.title;
      if (!title) return;
      unitsByProduct[title] = (unitsByProduct[title] || 0) + item.quantity;
    });
    return products
      .map(product => ({
        name: product.title,
        unitsSold: unitsByProduct[product.title] || 0,
        stock: product.stock,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [products, myItems]);

  // Top products by revenue, for the "Top Products" list below
  const topProducts = useMemo(() => {
    const totals: Record<string, { sales: number; revenue: number }> = {};
    myItems.forEach(item => {
      const title = item.products?.title;
      if (!title) return;
      const entry = totals[title] || { sales: 0, revenue: 0 };
      entry.sales += item.quantity;
      entry.revenue += Number(item.total_price);
      totals[title] = entry;
    });
    return Object.entries(totals)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [myItems]);

  const recentOrders = useMemo(() => {
    return [...ordersForMe]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(order => {
        const myOrderItems = (order.order_items || []).filter(i => i.artist_id === artistId);
        return {
          id: order.id,
          customer: order.profiles?.display_name || order.profiles?.email || 'Unknown',
          product: myOrderItems.map(i => i.products?.title).filter(Boolean).join(', ') || 'N/A',
          amount: formatPrice(myOrderItems.reduce((sum, i) => sum + Number(i.total_price), 0)),
          status: order.status,
        };
      });
  }, [ordersForMe, artistId, formatPrice]);

  const recentPayouts = useMemo(
    () => payouts.slice(0, 5).map(p => ({
      id: p.id,
      date: p.created_at,
      amount: p.amount,
      status: (p.status === 'completed' || p.status === 'processing' ? p.status : 'pending') as 'pending' | 'processing' | 'completed',
    })),
    [payouts]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isArtist) {
    return <Navigate to="/artist-auth" replace />;
  }

  return (
    <>
      <SEOHelmet
        title="Artist Dashboard"
        description="Manage your art products, track sales, and view analytics on your artist dashboard."
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your art business today.
            </p>
          </div>
          <Button onClick={() => setCalendarOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/dashboard/products')}
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/dashboard/orders')}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View Orders</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/dashboard/profile')}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <KpiCard key={index} {...kpi} index={index} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <SalesChart data={salesData} loading={loading} />
          <ProductPerformance data={productPerformanceData} loading={loading} />
        </div>

        {/* Lower Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No products yet</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.product}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.amount}</p>
                        <p className="text-sm text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payouts */}
          <PayoutsList payouts={recentPayouts} loading={loading} />
        </div>
      </div>

      <CalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} />
    </>
  );
}
