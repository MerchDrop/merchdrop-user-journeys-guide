import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KpiCard from '@/components/dashboard/KpiCard';
import SalesChart from '@/components/dashboard/SalesChart';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import RecentOrders from '@/components/dashboard/RecentOrders';
import PayoutsList from '@/components/dashboard/PayoutsList';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import SEOHelmet from '@/components/SEO/SEOHelmet';

const salesData: any[] = [];
const recentOrders: any[] = [];
const products: any[] = [];
const payouts: any[] = [];
const goals: any[] = [];

export default function Dashboard() {
  const { user, isArtist, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);

  // Empty data for new users - they start with a clean slate
  const kpiData = [
    { title: 'Total Sales', value: formatPrice(0), change: '+0%', trend: 'neutral' as const, icon: DollarSign },
    { title: 'Orders', value: '0', change: '+0%', trend: 'neutral' as const, icon: ShoppingCart },
    { title: 'Products', value: '0', change: '+0%', trend: 'neutral' as const, icon: Package },
    { title: 'Customers', value: '0', change: '+0%', trend: 'neutral' as const, icon: Users },
  ];

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
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
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <KpiCard key={index} {...kpi} index={index} />
          ))}
        </div>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Goals & Progress
            </CardTitle>
            <CardDescription>Track your progress toward monthly goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No goals set yet</p>
            ) : (
              goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{goal.title}</span>
                    <span className="text-muted-foreground">{goal.current} / {goal.target}</span>
                  </div>
                  <Progress value={goal.percentage} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <SalesChart data={salesData} loading={loading} />
          <ProductPerformance data={products} loading={loading} />
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
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No products yet</p>
              ) : (
                products.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue}</p>
                      <p className="text-sm text-green-600">{product.growth}</p>
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
          <PayoutsList payouts={payouts} loading={loading} />
        </div>
      </div>
    </>
  );
}