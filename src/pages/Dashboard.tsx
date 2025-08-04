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
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ProductPerformance from "@/components/dashboard/ProductPerformance";
import PayoutsList from "@/components/dashboard/PayoutsList";

// Mock data for the dashboard
const mockKpiData = [
  {
    title: "Total Revenue",
    value: "$12,458",
    change: "18.2%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Products Sold",
    value: "342",
    change: "12.5%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Profile Views",
    value: "2,847",
    change: "8.1%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Active Products",
    value: "15",
    change: "25.0%",
    trend: "up" as const,
    icon: BarChart3,
  },
];

const mockSalesData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  sales: Math.floor(Math.random() * 1000) + 200,
}));

const mockRecentOrders = [
  {
    id: "ORD-12345",
    date: "2024-01-15",
    itemCount: 2,
    total: 59.99,
    status: "delivered" as const,
    product: "Artist T-Shirt - Black",
    customer: "John D."
  },
  {
    id: "ORD-12346",
    date: "2024-01-14", 
    itemCount: 1,
    total: 39.99,
    status: "shipped" as const,
    product: "Vinyl Record Print",
    customer: "Sarah M."
  },
  {
    id: "ORD-12347",
    date: "2024-01-14",
    itemCount: 3,
    total: 89.97,
    status: "processing" as const,
    product: "Tour Hoodie - White",
    customer: "Mike R."
  },
];

const mockProducts = [
  { name: "Artist T-Shirt", unitsSold: 124, stock: 67 },
  { name: "Tour Hoodie", unitsSold: 87, stock: 23 },
  { name: "Vinyl Print", unitsSold: 65, stock: 45 },
  { name: "Phone Case", unitsSold: 32, stock: 12 },
];

const mockPayouts = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 1250.00,
    status: "pending" as const,
  },
  {
    id: "2", 
    date: "2024-01-01",
    amount: 890.50,
    status: "completed" as const,
  },
];

const mockGoals = [
  { title: "Monthly Revenue", current: 12458, target: 15000, progress: 83 },
  { title: "Product Sales", current: 342, target: 500, progress: 68 },
  { title: "New Followers", current: 847, target: 1000, progress: 85 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockKpiData.map((kpi, index) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={kpi.icon}
              index={index}
            />
          ))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockGoals.map((goal, index) => (
                  <div key={goal.title} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{goal.title}</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${goal.current.toLocaleString()}</span>
                      <span>${goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesChart data={mockSalesData} loading={loading} />
          <ProductPerformance data={mockProducts} loading={loading} />
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
                {mockProducts.slice(0, 3).map((product, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  {mockRecentOrders.map((order) => (
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
                        <p className="font-medium">${order.total}</p>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                          order.status === "shipped" ? "secondary" : 
                          "outline"
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <PayoutsList payouts={mockPayouts} loading={loading} />
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
    </DashboardLayout>
  );
}