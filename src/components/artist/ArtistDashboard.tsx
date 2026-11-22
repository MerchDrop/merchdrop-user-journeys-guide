import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { countsAsSale, type ArtistOrder } from '@/hooks/useArtistOrders';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/context/CurrencyContext';
import { CalendarDialog } from '@/components/dialogs/CalendarDialog';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  Eye, 
  ShoppingCart,
  Star,
  Calendar,
  Clock,
  Target,
  Plus,
  ExternalLink,
  BarChart3,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalOrders: number;
  pendingOrders: number;
}

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  views: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ArtistDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    publishedProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get artist profile
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!profile) return;
      setArtistProfile(profile);

      // Load products stats
      const { data: products } = await supabase
        .from('products')
        .select('id, title, status, price_cents, created_at')
        .eq('artist_id', profile.id);

      // Paid orders with only this artist's items (artist_orders() in the DB). Prices are in naira.
      const [{ data: orderData, error: ordersError }, { data: rating }] = await Promise.all([
        supabase.rpc('artist_orders'),
        supabase.from('public_artist_profiles').select('average_rating').eq('id', profile.id).maybeSingle(),
      ]);
      if (ordersError) throw ordersError;
      const allOrders = (orderData as unknown as ArtistOrder[]) ?? [];
      const orders = allOrders.filter(countsAsSale);
      const lines = orders.flatMap((o) => (o.items ?? []).map((i) => ({ ...i, created_at: o.created_at })));
      const sumRevenue = (ls: typeof lines) => ls.reduce((sum, l) => sum + Number(l.total_price), 0);
      const sumUnits = (ls: typeof lines) => ls.reduce((sum, l) => sum + l.quantity, 0);
      const inMonth = (iso: string, d: Date) => {
        const x = new Date(iso);
        return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear();
      };
      const now = new Date();

      setStats({
        totalProducts: products?.length || 0,
        publishedProducts: products?.filter((p) => p.status === 'published').length || 0,
        totalSales: sumUnits(lines),
        totalRevenue: sumRevenue(lines),
        monthlyRevenue: sumRevenue(lines.filter((l) => inMonth(l.created_at, now))),
        averageRating: Number(rating?.average_rating) || 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => ['payment_received', 'processing'].includes(o.status)).length,
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setSalesData([5, 4, 3, 2, 1, 0].map((back) => {
        const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
        const monthLines = lines.filter((l) => inMonth(l.created_at, d));
        return { month: monthNames[d.getMonth()], sales: sumUnits(monthLines), revenue: sumRevenue(monthLines) };
      }));

      // Top 5 products by revenue.
      const byProduct = new Map<string, ProductPerformance>();
      for (const l of lines) {
        const key = l.product_id ?? l.title ?? 'item';
        const row = byProduct.get(key) ?? { name: l.title ?? 'Item', sales: 0, revenue: 0, views: 0 };
        byProduct.set(key, { ...row, sales: row.sales + l.quantity, revenue: row.revenue + Number(l.total_price) });
      }
      const performanceData = [...byProduct.values()].sort((x, y) => y.revenue - x.revenue).slice(0, 5);
      setProductPerformance(performanceData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Check if artist is pending approval
  const isPending = artistProfile?.status === 'pending';

  if (isPending) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="h-5 w-5" />
              Account Pending Approval
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Your artist account is currently under review. This process typically takes up to 48 hours. 
              You'll be notified via email once your account is approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              While you wait, complete your profile to help speed up the approval process!
            </p>
            <Button onClick={() => navigate('/dashboard/profile')} className="gap-2">
              <UserIcon className="h-4 w-4" />
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>

        {/* Profile Stats - Read Only */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 opacity-60 pointer-events-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Available after approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Available after approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Available after approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Available after approval</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {artistProfile?.artist_name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's how your store is performing
          </p>
        </div>
        <Badge variant={artistProfile?.status === 'approved' ? 'default' : 'secondary'}>
          {artistProfile?.status}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(stats.monthlyRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedProducts} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRating ? 'From customer reviews' : 'No reviews yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPrice(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(Number(value)) : value,
                    name
                  ]} />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Track your progress with real-time metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Monthly Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatPrice(stats.totalRevenue)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Published Products</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.publishedProducts}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalProducts} total products
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Average Rating</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">
                    From {stats.totalOrders} orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/dashboard/products')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (artistProfile?.artist_slug) {
                  navigate(`/artist/${artistProfile.artist_slug}`);
                }
              }}
              disabled={!artistProfile?.artist_slug}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Store
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCalendarOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <CalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} />
    </div>
  );
};