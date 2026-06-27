import React, { useState, useEffect } from 'react';
import NewsletterSubscribers from '@/components/admin/NewsletterSubscribers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';
import { useOrders } from '@/hooks/useOrdersQuery';
import { useProducts } from '@/hooks/useProductsQuery';
import { supabase } from '@/integrations/supabase/client';
import { OrderDetailsDialog } from '@/components/artist/OrderDetailsDialog';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalArtists: number;
  pendingArtists: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalArtists: 0,
    pendingArtists: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Fetch total revenue and orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at, order_number, profiles(display_name)')
        .order('created_at', { ascending: false });

      // Fetch total products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, status');

      // Fetch artists
      const { data: artists } = await supabase
        .from('artist_profiles')
        .select('id, status, artist_name, total_sales');

      // Fetch top selling products
      const { data: topProducts } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products(title, main_image_url)
        `);

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalArtists = artists?.filter(a => a.status === 'approved').length || 0;
      const pendingArtists = artists?.filter(a => a.status === 'pending').length || 0;
      const recentOrders = orders?.slice(0, 5) || [];

      // Calculate top products
      const productSales: { [key: string]: { quantity: number; product: any } } = {};
      topProducts?.forEach(item => {
        if (item.product_id && item.products) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { quantity: 0, product: item.products };
          }
          productSales[item.product_id].quantity += item.quantity;
        }
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalArtists,
        pendingArtists,
        recentOrders,
        topProducts: topProductsList
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Artists',
      value: stats.totalArtists.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>
        <Button onClick={fetchAdminStats} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`h-12 w-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert for pending artists */}
      {stats.pendingArtists > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">Pending Artist Approvals</h3>
                  <p className="text-sm text-yellow-700">
                    {stats.pendingArtists} artist{stats.pendingArtists !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/artists')}
                >
                  Review Artists
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order, index) => (
                    <div 
                      key={order.order_number} 
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        setSelectedOrder({
                          ...order,
                          customer_name: order.profiles?.display_name || 'N/A',
                          customer_email: order.profiles?.email || 'N/A',
                          product_title: order.order_items?.[0]?.products?.title || 'N/A',
                          quantity: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
                        });
                        setOrderDialogOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.order_number}</span>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.profiles?.display_name || 'Unknown Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(order.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        {item.product.main_image_url ? (
                          <img 
                            src={item.product.main_image_url} 
                            alt={item.product.title}
                            className="h-10 w-10 object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{item.product.title}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No sales data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <NewsletterSubscribers />

      <OrderDetailsDialog
        order={selectedOrder}
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
      />
    </div>
  );
}