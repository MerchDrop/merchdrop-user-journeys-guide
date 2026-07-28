import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PlatformSalesReport = () => {
  const { formatPrice } = useCurrency();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    netProfit: 0,
    artistPayouts: 0,
    platformFee: 0,
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');

      if (orders && orders.length > 0) {
        const gross = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const payouts = gross * 0.7; // 70% artist payout split
        const platform = gross * 0.3; // 30% platform margin
        setTotals({
          totalRevenue: gross,
          netProfit: platform,
          artistPayouts: payouts,
          platformFee: platform,
        });

        // Group by month
        const monthly: { [key: string]: { grossRevenue: number; netProfit: number; totalPayouts: number } } = {};
        orders.forEach((o) => {
          const month = o.created_at ? new Date(o.created_at).toLocaleString('default', { month: 'short' }) : 'Recent';
          if (!monthly[month]) {
            monthly[month] = { grossRevenue: 0, netProfit: 0, totalPayouts: 0 };
          }
          monthly[month].grossRevenue += o.total_amount || 0;
          monthly[month].totalPayouts += (o.total_amount || 0) * 0.7;
          monthly[month].netProfit += (o.total_amount || 0) * 0.3;
        });

        const chart = Object.keys(monthly).map((m) => ({
          month: m,
          ...monthly[m],
        }));
        setSalesData(chart);
      } else {
        setSalesData([]);
        setTotals({ totalRevenue: 0, netProfit: 0, artistPayouts: 0, platformFee: 0 });
      }
    } catch (e) {
      console.error('Error fetching sales report:', e);
    }
  };

  const summaryStats = [
    {
      title: 'Total Revenue',
      value: formatPrice(totals.totalRevenue),
      change: 'Live',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Net Profit',
      value: formatPrice(totals.netProfit),
      change: 'Live',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Artist Payouts',
      value: formatPrice(totals.artistPayouts),
      change: 'Live',
      icon: CreditCard,
      color: 'text-purple-500',
    },
    {
      title: 'Platform Margin',
      value: formatPrice(totals.platformFee),
      change: 'Live',
      icon: Banknote,
      color: 'text-orange-500',
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Financial Reports</h2>
          <p className="text-muted-foreground">Platform revenue and payout analytics</p>
        </div>
        <Select defaultValue="90d">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    typeof name === 'string' 
                      ? name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                      : name
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="grossRevenue"
                  fill="hsl(var(--primary))"
                  name="Gross Revenue"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="netProfit"
                  fill="hsl(var(--secondary))"
                  name="Net Profit"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalPayouts"
                  fill="hsl(var(--accent))"
                  name="Total Payouts"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Maya Rodriguez', revenue: formatPrice(8450), products: 12 },
                { name: 'Alex Chen', revenue: formatPrice(6230), products: 8 },
                { name: 'Luna Martinez', revenue: formatPrice(5890), products: 15 },
                { name: 'David Kim', revenue: formatPrice(4720), products: 6 },
              ].map((artist, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {artist.products} products
                    </p>
                  </div>
                  <Badge variant="secondary">{artist.revenue}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Selling Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Prints & Posters', revenue: formatPrice(28450), percentage: '42%' },
                { category: 'Apparel', revenue: formatPrice(19230), percentage: '28%' },
                { category: 'Home Decor', revenue: formatPrice(15890), percentage: '23%' },
                { category: 'Accessories', revenue: formatPrice(4720), percentage: '7%' },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.percentage} of total sales
                    </p>
                  </div>
                  <Badge variant="secondary">{category.revenue}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformSalesReport;