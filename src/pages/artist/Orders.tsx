import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'outline' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  processing: {
    label: 'Processing',
    variant: 'secondary' as const,
    icon: Package,
    color: 'text-blue-600'
  },
  shipped: {
    label: 'Shipped',
    variant: 'default' as const,
    icon: Truck,
    color: 'text-purple-600'
  },
  delivered: {
    label: 'Delivered',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  }
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { formatPrice } = useCurrency();
  const { orders, loading, fetchOrders } = useOrders();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      // Fetch orders for this artist
      fetchOrders({ artistId: profile.id });
    }
  }, [profile?.id]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_items?.some(item => 
                           item.products?.title?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your customer orders
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">{deliveredOrders}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <CardTitle>Order History</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => {
                      const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
                      const firstItem = order.order_items?.[0];
                      const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                      
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">#{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.profiles?.display_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{order.profiles?.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium truncate">
                                {firstItem?.products?.title || 'Unknown Product'}
                              </div>
                              {order.order_items && order.order_items.length > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  +{order.order_items.length - 1} more item{order.order_items.length > 2 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{totalItems}</TableCell>
                          <TableCell className="font-medium">{formatPrice(order.total_amount)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusConfig[order.status as keyof typeof statusConfig].variant}
                              className="gap-1"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[order.status as keyof typeof statusConfig].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}