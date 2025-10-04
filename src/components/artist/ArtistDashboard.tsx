import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  BarChart3
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
        .select('id, status, price_cents, created_at')
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

      // Product performance data
      const performanceData = products?.slice(0, 5).map(product => ({
        name: `Product ${product.id.slice(0, 8)}`,
        sales: 0,
        revenue: 0,
        views: 0,
      })) || [];
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Monthly Revenue Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.min(100, (stats.monthlyRevenue / 1000) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (stats.monthlyRevenue / 1000) * 100)}%` }}
                    />
                  </div>
                  <div className="text-lg font-semibold">
                    {formatPrice(stats.monthlyRevenue)} / {formatPrice(1000)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal: 10 Products</span>
                    <span>{Math.min(100, (stats.publishedProducts / 10) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (stats.publishedProducts / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.publishedProducts} / 10
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal: 4.5/5</span>
                    <span>{Math.min(100, (stats.averageRating / 4.5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (stats.averageRating / 4.5) * 100)}%` }}
                    />
                  </div>
                  <div className="text-lg font-semibold">
                    {stats.averageRating.toFixed(1)} / 4.5
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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