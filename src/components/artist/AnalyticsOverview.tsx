import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ShoppingCart, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import { useMyArtistProfile } from '@/hooks/useMyArtistProfile';
import { useOrdersQuery } from '@/hooks/useOrdersQuery';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

async function fetchFollowerCount(artistId: string): Promise<number> {
  const { count, error } = await supabase
    .from('artist_follows')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artistId);
  if (error) throw error;
  return count || 0;
}

export function AnalyticsOverview() {
  const { formatPrice } = useCurrency();
  const { data: artistProfile } = useMyArtistProfile();
  const artistId = artistProfile?.id;

  const { data: orders = [] } = useOrdersQuery({ artistId });
  const { data: products = [] } = useProductsQuery({ artist: artistId });
  const { data: followerCount = 0 } = useQuery({
    queryKey: ['artistFollowerCount', artistId],
    queryFn: () => fetchFollowerCount(artistId!),
    enabled: !!artistId,
  });

  // This artist's line items across all their orders
  const myItems = useMemo(
    () => orders.flatMap(order => (order.order_items || []).filter(item => item.artist_id === artistId)),
    [orders, artistId]
  );

  const totalRevenue = myItems.reduce((sum, item) => sum + Number(item.total_price), 0);
  const totalOrders = new Set(
    orders.filter(o => (o.order_items || []).some(i => i.artist_id === artistId)).map(o => o.id)
  ).size;

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Products',
      value: products.length.toString(),
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-purple-600',
    },
    {
      title: 'Followers',
      value: followerCount.toString(),
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  // Revenue + order count for each of the last 30 days
  const salesData = useMemo(() => {
    const byDay: Record<string, { revenue: number; orders: number }> = {};
    myItems.forEach(item => {
      const order = orders.find(o => (o.order_items || []).includes(item));
      if (!order) return;
      const dayKey = new Date(order.created_at).toISOString().slice(0, 10);
      const entry = byDay[dayKey] || { revenue: 0, orders: 0 };
      entry.revenue += Number(item.total_price);
      byDay[dayKey] = entry;
    });
    // Count distinct orders per day (not per line item)
    orders.forEach(order => {
      if (!(order.order_items || []).some(i => i.artist_id === artistId)) return;
      const dayKey = new Date(order.created_at).toISOString().slice(0, 10);
      const entry = byDay[dayKey] || { revenue: 0, orders: 0 };
      entry.orders += 1;
      byDay[dayKey] = entry;
    });

    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayKey = date.toISOString().slice(0, 10);
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: byDay[dayKey]?.revenue || 0,
        orders: byDay[dayKey]?.orders || 0,
      });
    }
    return result;
  }, [myItems, orders, artistId]);

  const topProducts = useMemo(() => {
    const totals: Record<string, number> = {};
    myItems.forEach(item => {
      const title = item.products?.title;
      if (!title) return;
      totals[title] = (totals[title] || 0) + Number(item.total_price);
    });
    return Object.entries(totals)
      .map(([name, value], index) => ({ name, value, color: CHART_COLORS[index % CHART_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [myItems]);

  // Split by the artist's actual commission rate instead of a fabricated percentage
  const commissionRate = artistProfile?.commission_rate ?? 15;
  const platformShare = totalRevenue * (commissionRate / 100);
  const artistShare = totalRevenue - platformShare;
  const revenueBreakdown = [
    { name: `Artist (${(100 - commissionRate).toFixed(0)}%)`, value: artistShare, color: CHART_COLORS[0] },
    { name: `Platform (${commissionRate.toFixed(0)}%)`, value: platformShare, color: CHART_COLORS[1] },
  ];

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your performance over the last 30 days</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-16">No sales yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                          label
                        >
                          {topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {topProducts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-medium">{formatPrice(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{formatPrice(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Order Value</span>
                <span className="font-medium">{formatPrice(avgOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Commission Rate</span>
                <span className="font-medium">{commissionRate.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Products Listed</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{followerCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
