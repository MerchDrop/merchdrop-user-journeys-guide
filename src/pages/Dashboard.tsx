import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  CreditCard,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ProductPerformance from "@/components/dashboard/ProductPerformance";
import PayoutsList from "@/components/dashboard/PayoutsList";

// Mock data for the dashboard
const mockKpiData = [
  {
    title: "Total Sales",
    value: "$45,231",
    change: "12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,247",
    change: "8.2%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Pending Payouts",
    value: "$3,421",
    change: "2.1%",
    trend: "down" as const,
    icon: CreditCard,
  },
  {
    title: "Active Products",
    value: "89",
    change: "15.3%",
    trend: "up" as const,
    icon: BarChart3,
  },
];

const mockSalesData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  sales: Math.floor(Math.random() * 1000) + 500,
}));

const mockRecentOrders = [
  {
    id: "12345",
    date: "2024-01-15",
    itemCount: 3,
    total: 159.99,
    status: "delivered" as const,
  },
  {
    id: "12346",
    date: "2024-01-14", 
    itemCount: 1,
    total: 89.99,
    status: "shipped" as const,
  },
  {
    id: "12347",
    date: "2024-01-14",
    itemCount: 2,
    total: 129.99,
    status: "processing" as const,
  },
  {
    id: "12348",
    date: "2024-01-13",
    itemCount: 1,
    total: 39.99,
    status: "pending" as const,
  },
  {
    id: "12349",
    date: "2024-01-13",
    itemCount: 4,
    total: 199.99,
    status: "delivered" as const,
  },
];

const mockProductData = [
  { name: "Vinyl Record", unitsSold: 156, stock: 24 },
  { name: "T-Shirt", unitsSold: 243, stock: 67 },
  { name: "Art Print", unitsSold: 89, stock: 12 },
  { name: "Hoodie", unitsSold: 67, stock: 34 },
  { name: "Poster", unitsSold: 45, stock: 18 },
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
  {
    id: "3",
    date: "2023-12-15",
    amount: 1680.25,
    status: "completed" as const,
  },
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
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your store today.
            </p>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesChart data={mockSalesData} loading={loading} />
          <ProductPerformance data={mockProductData} loading={loading} />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrders orders={mockRecentOrders} loading={loading} />
          </div>
          <PayoutsList payouts={mockPayouts} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}