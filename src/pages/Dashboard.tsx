import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Plus,
  Calendar,
  Download,
  Star,
  Eye
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statsCards = [
  {
    title: "Total Revenue",
    value: "$12,436",
    change: "+18.2%",
    changeType: "positive",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Orders",
    value: "347",
    change: "+12.5%", 
    changeType: "positive",
    icon: Package,
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "Products",
    value: "24",
    change: "+3",
    changeType: "positive",
    icon: BarChart3,
    color: "from-purple-500 to-violet-600"
  },
  {
    title: "Followers",
    value: "45.2K",
    change: "+8.1%",
    changeType: "positive", 
    icon: Users,
    color: "from-pink-500 to-rose-600"
  }
];

const recentOrders = [
  {
    id: "MD-2024-347",
    product: "Midnight Vibes Hoodie",
    customer: "Alex Chen",
    amount: "$55.00",
    status: "completed",
    date: "2 hours ago"
  },
  {
    id: "MD-2024-346",
    product: "Ethereal Dreams Tee",
    customer: "Sarah Miller", 
    amount: "$35.00",
    status: "shipped",
    date: "5 hours ago"
  },
  {
    id: "MD-2024-345",
    product: "Luna Logo Cap",
    customer: "Mike Rodriguez",
    amount: "$28.00", 
    status: "processing",
    date: "8 hours ago"
  }
];

const topProducts = [
  {
    name: "Midnight Vibes Hoodie",
    sales: 89,
    revenue: "$4,895",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop&auto=format"
  },
  {
    name: "Ethereal Dreams Tee", 
    sales: 156,
    revenue: "$5,460",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&auto=format"
  },
  {
    name: "Luna Logo Cap",
    sales: 234,
    revenue: "$6,552",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1588117260148-b47c0c19383d?w=80&h=80&fit=crop&auto=format"
  }
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Artist Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, Luna Rivers! Here's your merch empire overview.
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Drop
              </Button>
            </div>
          </motion.div>

          {/* Period Selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 mb-8"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-4">Period:</span>
            {["24h", "7d", "30d", "90d"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-0.5`}>
                      <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <Badge variant={stat.changeType === "positive" ? "default" : "destructive"}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Orders */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
                
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.id} • {order.customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.amount}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'shipped' ? 'secondary' : 
                              'outline'
                            }
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{order.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </Card>
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Top Performing Products</h3>
                
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cover bg-center rounded-lg" 
                           style={{ backgroundImage: `url(${product.image})` }} />
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{product.sales} sold</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            {product.rating}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-primary">{product.revenue}</p>
                        <p className="text-sm text-muted-foreground">#{index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <Eye className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button variant="outline" size="lg" className="h-24 flex-col">
                  <Plus className="h-8 w-8 mb-2" />
                  Create New Product
                </Button>
                
                <Button variant="outline" size="lg" className="h-24 flex-col">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  View Analytics
                </Button>
                
                <Button variant="outline" size="lg" className="h-24 flex-col">
                  <DollarSign className="h-8 w-8 mb-2" />
                  Request Payout
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}