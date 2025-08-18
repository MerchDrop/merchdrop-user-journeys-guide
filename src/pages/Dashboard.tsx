import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  CreditCard,
  BarChart3,
  Users,
  TrendingUp,
  Plus,
  Star,
  Calendar,
  Target
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ProductPerformance from "@/components/dashboard/ProductPerformance";
import PayoutsList from "@/components/dashboard/PayoutsList";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Initialize empty data for clean state
  const kpiData: any[] = [];
  const salesData: any[] = [];
  const products: any[] = [];
  const goals: any[] = [];
  const recentOrders: any[] = [];
  const payouts: any[] = [];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, Artist! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's how your merch is performing today.
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild>
              <Link to="/create-merch">
                <Plus className="h-4 w-4 mr-2" />
                Create Merch
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/onboarding">
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No KPI data available yet. Start creating products to see metrics.
            </div>
          ) : (
            kpiData.map((kpi, index) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.title === "Total Revenue" ? formatPrice(kpi.value as number) : kpi.value.toString()}
                change={kpi.change}
                trend={kpi.trend}
                icon={kpi.icon}
                index={index}
              />
            ))
          )}
        </div>

        {/* Goals Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No goals set yet</p>
                ) : (
                  goals.map((goal, index) => (
                    <div key={goal.title} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{goal.title}</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>{formatPrice(goal.current)}</span>
                         <span>{formatPrice(goal.target)}</span>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SalesChart data={salesData} loading={loading} />
          <ProductPerformance data={products} loading={loading} />
        </div>

        {/* Product Quick Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Products</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/products">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No products yet</p>
                ) : (
                  products.slice(0, 3).map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{product.unitsSold} sold</span>
                          <span>{product.stock} in stock</span>
                        </div>
                      </div>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent orders</p>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium">{order.product}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{order.customer}</span>
                            <span>•</span>
                            <span>{order.date}</span>
                          </div>
                        </div>
                         <div className="text-right">
                           <p className="font-medium">{formatPrice(order.total)}</p>
                          <Badge variant={
                            order.status === "delivered" ? "default" :
                            order.status === "shipped" ? "secondary" : 
                            "outline"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <PayoutsList payouts={payouts} loading={loading} />
        </div>

        {/* Support & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <h4 className="font-medium">Design Support</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Request custom design help
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <h4 className="font-medium">Marketing Tips</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Learn how to promote your merch
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <h4 className="font-medium">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get help with platform issues
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}