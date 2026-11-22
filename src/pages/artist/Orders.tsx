import React, { useState } from 'react';
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
import { OrderDetailsDialog } from '@/components/artist/OrderDetailsDialog';
import { useArtistOrders, type ArtistOrder } from '@/hooks/useArtistOrders';
import { useCurrency } from '@/context/CurrencyContext';
import { orderStatusLabel, orderStatusTone } from '@/lib/orderStatus';
import { downloadCsv, toCsv } from '@/lib/csv';

// One row per order, scoped to this artist's items — the shape OrderDetailsDialog expects.
interface ArtistOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_title: string;
  quantity: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

function toArtistOrderRow(order: ArtistOrder): ArtistOrderRow {
  const items = order.items ?? [];
  return {
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: '',
    product_title: [...new Set(items.map((i) => i.title).filter(Boolean))].join(', ') || 'Item',
    quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    total_amount: items.reduce((sum, i) => sum + Number(i.total_price), 0),
    status: order.status,
    payment_status: order.payment_status,
    created_at: order.created_at,
    shipped_at: order.shipped_at,
    delivered_at: order.delivered_at,
  };
}

export default function ArtistOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ArtistOrderRow | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const ordersPerPage = 10;

  const { formatPrice } = useCurrency();
  const { data: rawOrders = [], isLoading, error } = useArtistOrders();
  const orders = rawOrders.map(toArtistOrderRow);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = orders
    .filter((o) => !['refunded', 'cancelled'].includes(o.status))
    .reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => ['payment_received', 'processing'].includes(order.status)).length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  const handleViewOrder = (order: ArtistOrderRow) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleExport = () => {
    downloadCsv('merchdrop-orders.csv', toCsv(
      ['Order number', 'Customer', 'Products', 'Quantity', 'Your sales (NGN)', 'Status', 'Date'],
      filteredOrders.map((o) => [o.order_number, o.customer_name, o.product_title, o.quantity,
        o.total_amount, orderStatusLabel(o.status), o.created_at.slice(0, 10)]),
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your customer orders
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{deliveredOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Order Management</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="payment_received">Payment received</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="on_the_way">On its way</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading orders…
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-destructive">
                      We couldn't load your orders. Please refresh the page.
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No orders found</p>
                        <p className="text-sm text-muted-foreground">
                          Orders will appear here once customers start purchasing your products.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.product_title}</p>
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          aria-label={`View order ${order.order_number}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}
