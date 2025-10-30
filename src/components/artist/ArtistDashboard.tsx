import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
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

      // Load orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items!inner(
            quantity,
            unit_price,
            product_id,
            products!inner(artist_id)
          )
        `)
        .eq('order_items.products.artist_id', profile.id);

      // Calculate stats
      const totalProducts = products?.length || 0;
      const publishedProducts = products?.filter(p => p.status === 'published').length || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      
      // Calculate revenue
      const totalRevenue = orders?.reduce((sum, order) => {
        const artistItems = order.order_items.filter(item => 
          item.products.artist_id === profile.id
        );
        return sum + artistItems.reduce((itemSum, item) => 
          itemSum + (item.unit_price * item.quantity), 0
        );
      }, 0) || 0;

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      }).reduce((sum, order) => {
        const artistItems = order.order_items.filter(item => 
          item.products.artist_id === profile.id
        );
        return sum + artistItems.reduce((itemSum, item) => 
          itemSum + (item.unit_price * item.quantity), 0
        );
      }, 0) || 0;

      const totalSales = orders?.reduce((sum, order) => {
        return sum + order.order_items.filter(item => 
          item.products.artist_id === profile.id
        ).reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0) || 0;

      setStats({
        totalProducts,
        publishedProducts,
        totalSales,
        totalRevenue: totalRevenue / 100, // Convert from cents
        monthlyRevenue: monthlyRevenue / 100,
        averageRating: 0,
        totalOrders,
        pendingOrders,
      });

      // Generate sales data for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesDataArray = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        }) || [];

        const monthSales = monthOrders.reduce((sum, order) => {
          return sum + order.order_items.filter(item => 
            item.products.artist_id === profile.id
          ).reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const monthRevenue = monthOrders.reduce((sum, order) => {
          const artistItems = order.order_items.filter(item => 
            item.products.artist_id === profile.id
          );
          return sum + artistItems.reduce((itemSum, item) => 
            itemSum + (item.unit_price * item.quantity), 0
          );
        }, 0);

        salesDataArray.push({
          month: monthNames[date.getMonth()],
          sales: monthSales,
          revenue: monthRevenue / 100,
        });
      }
      setSalesData(salesDataArray);

      // Product performance data - get actual product names and calculate sales
      const { data: productsWithDetails } = await supabase
        .from('products')
        .select('id, title, price_cents')
        .eq('artist_id', profile.id)
        .eq('status', 'published')
        .limit(5);

      const performanceData = await Promise.all(
        (productsWithDetails || []).map(async (product) => {
          // Calculate sales and revenue for this product
          const productOrders = orders?.filter(order => 
            order.order_items.some(item => item.product_id === product.id)
          ) || [];

          const sales = productOrders.reduce((sum, order) => {
            return sum + order.order_items
              .filter(item => item.product_id === product.id)
              .reduce((itemSum, item) => itemSum + item.quantity, 0);
          }, 0);

          const revenue = productOrders.reduce((sum, order) => {
            return sum + order.order_items
              .filter(item => item.product_id === product.id)
              .reduce((itemSum, item) => itemSum + (item.unit_price * item.quantity), 0);
          }, 0);

          return {
            name: product.title,
            sales,
            revenue: revenue / 100,
            views: 0, // Views tracking not yet implemented
          };
        })
      );
      
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
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalOrders} reviews
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
                  <Bar dataKey="views" fill="#82ca9d" name="Views" />
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