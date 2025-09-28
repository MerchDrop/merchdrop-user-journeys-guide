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

// Mock sales data
const mockSalesData = [
  {
    month: 'Jan',
    grossRevenue: 12500,
    netProfit: 8750,
    totalPayouts: 3750,
  },
  {
    month: 'Feb',
    grossRevenue: 15200,
    netProfit: 10640,
    totalPayouts: 4560,
  },
  {
    month: 'Mar',
    grossRevenue: 18700,
    netProfit: 13090,
    totalPayouts: 5610,
  },
  {
    month: 'Apr',
    grossRevenue: 16800,
    netProfit: 11760,
    totalPayouts: 5040,
  },
  {
    month: 'May',
    grossRevenue: 21400,
    netProfit: 14980,
    totalPayouts: 6420,
  },
  {
    month: 'Jun',
    grossRevenue: 19300,
    netProfit: 13510,
    totalPayouts: 5790,
  },
];

const summaryStats = (formatPrice: (price: number) => string) => [
  {
    title: 'Total Revenue',
    value: formatPrice(103900),
    change: '+12.5%',
    icon: DollarSign,
    color: 'text-green-500'
  },
  {
    title: 'Net Profit',
    value: formatPrice(72730),
    change: '+8.2%',
    icon: TrendingUp,
    color: 'text-blue-500'
  },
  {
    title: 'Artist Payouts',
    value: formatPrice(31170),
    change: '+15.3%',
    icon: CreditCard,
    color: 'text-purple-500'
  },
  {
    title: 'Platform Fee',
    value: formatPrice(31170),
    change: '+10.1%',
    icon: Banknote,
    color: 'text-orange-500'
  },
];

const PlatformSalesReport = () => {
  const { formatPrice } = useCurrency();
  
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
        {summaryStats(formatPrice).map((stat, index) => {
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
              <BarChart data={mockSalesData}>
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
                { name: 'Maya Rodriguez', revenue: '$8,450', products: 12 },
                { name: 'Alex Chen', revenue: '$6,230', products: 8 },
                { name: 'Luna Martinez', revenue: '$5,890', products: 15 },
                { name: 'David Kim', revenue: '$4,720', products: 6 },
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
                { category: 'Prints & Posters', revenue: '$28,450', percentage: '42%' },
                { category: 'Apparel', revenue: '$19,230', percentage: '28%' },
                { category: 'Home Decor', revenue: '$15,890', percentage: '23%' },
                { category: 'Accessories', revenue: '$4,720', percentage: '7%' },
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