import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useOrders } from '@/hooks/useOrdersQuery';
import { MoreHorizontal, Eye, Edit, Search, Download, Printer } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { downloadCsv, toCsv } from '@/lib/csv';
import { printPackingSlips, type SlipOrder } from '@/lib/packingSlip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { OrderStatusDialog } from './OrderStatusDialog';
import { OrderTrackingBadge } from './OrderTrackingBadge';
import { OrderDetailsDialog } from '@/components/artist/OrderDetailsDialog';
import { useCurrency } from '@/context/CurrencyContext';
import { ADMIN_STATUSES, ORDER_STATUS_LABELS, orderStatusLabel, orderStatusTone } from '@/lib/orderStatus';

// Shipped needs a carrier and tracking number per order, so it isn't offered in bulk.
const BULK_STATUSES = ADMIN_STATUSES.filter((s) => s !== 'assigned_to_carrier');

export function AdminOrdersTable() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const { formatPrice } = useCurrency();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkRunning, setBulkRunning] = useState(false);

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default' as const;
      case 'pending':
        return 'outline' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, trackingNumber?: string, carrierName?: string) => {
    try {
      await updateOrderStatus(orderId, newStatus, trackingNumber, carrierName);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const openStatusDialog = (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const openDetailsDialog = (order: any) => {
    setSelectedOrder({
      ...order,
      customer_name: order.profiles?.display_name || 'Unknown Customer',
      customer_email: order.profiles?.email || 'N/A',
      product_title: order.order_items?.[0]?.products?.title || 'N/A',
      quantity: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    });
    setDetailsDialogOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order as any).customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a: any, b: any) => Number(b.needs_attention ?? false) - Number(a.needs_attention ?? false));

  const selectedOrders = filteredOrders.filter((o) => selected.has(o.id));
  const allSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filteredOrders.map((o) => o.id)));

  // One request per order through update-order-status, so emails and history work as usual.
  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    setBulkRunning(true);
    const failures: string[] = [];
    for (const order of selectedOrders) {
      try {
        await updateOrderStatus(order.id, bulkStatus);
      } catch (error) {
        failures.push(`${order.order_number}: ${error instanceof Error ? error.message : 'failed'}`);
      }
    }
    setBulkRunning(false);
    const done = selectedOrders.length - failures.length;
    if (done) toast.success(`${done} order${done === 1 ? '' : 's'} moved to ${orderStatusLabel(bulkStatus)}`);
    if (failures.length) toast.error(`${failures.length} not updated`, { description: failures.slice(0, 3).join('\n') });
    setSelected(new Set());
    setBulkStatus('');
  };

  const exportCsv = () => {
    const rows = (selectedOrders.length ? selectedOrders : filteredOrders).map((o: any) => {
      const a = (o.shipping_address ?? {}) as Record<string, string>;
      return [
        o.order_number, o.created_at?.slice(0, 10), `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim(),
        o.customer_email ?? o.profiles?.email ?? '', a.phone ?? '',
        [a.address, a.city, a.state, a.country].filter(Boolean).join(', '), a.shippingAxis ?? '',
        (o.order_items ?? []).map((i: any) => {
          const v = [i.product_variant?.color, i.product_variant?.size].filter(Boolean).join('/');
          return `${i.products?.title ?? 'Item'}${v ? ` (${v})` : ''} x${i.quantity}`;
        }).join('; '),
        Number(o.total_amount), orderStatusLabel(o.status), o.payment_status, o.carrier_name ?? '', o.tracking_number ?? '',
      ];
    });
    downloadCsv(`merchdrop-orders-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(
      ['Order', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Delivery zone', 'Items', 'Total (NGN)',
        'Status', 'Payment', 'Carrier', 'Tracking'], rows));
  };

  const printSlips = (orders: SlipOrder[]) => {
    if (!printPackingSlips(orders)) toast.error('Allow pop-ups for this site to print packing slips.');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Management</CardTitle>
        <CardDescription>
          View and manage all orders across the platform
        </CardDescription>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV{selectedOrders.length ? ` (${selectedOrders.length})` : ''}
          </Button>
        </div>
        {selectedOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2" role="region" aria-label="Bulk actions">
            <span className="text-sm font-medium">{selectedOrders.length} selected</span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[200px]" aria-label="New status"><SelectValue placeholder="Move to status…" /></SelectTrigger>
              <SelectContent>
                {BULK_STATUSES.map((s) => <SelectItem key={s} value={s}>{orderStatusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus || bulkRunning}>
              {bulkRunning ? 'Updating…' : 'Apply'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => printSlips(selectedOrders as SlipOrder[])}>
              <Printer className="h-4 w-4 mr-2" />Packing slips
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
            <span className="text-xs text-muted-foreground">Customers are emailed as usual. Use the row menu for Shipped.</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all orders" />
              </TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No orders match your filters.' : 'No orders found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} data-state={selected.has(order.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(order.id)} onCheckedChange={() => toggleOne(order.id)}
                      aria-label={`Select order ${order.order_number}`} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {order.profiles?.display_name || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.profiles?.email || (order as any).customer_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {order.order_items?.length || 0} items
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items?.slice(0, 2).map(item => item.products?.title).join(', ')}
                        {(order.order_items?.length || 0) > 2 && '...'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(Number(order.total_amount || '0'))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge className={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                      {(order as any).needs_attention && <Badge variant="destructive">Needs attention</Badge>}
                      {(order as any).return_requested_at && (
                        <span className="text-xs text-destructive max-w-[220px]" title={(order as any).return_reason ?? ''}>
                          Return requested: {(order as any).return_reason}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderTrackingBadge 
                      trackingNumber={order.tracking_number} 
                      status={order.status || 'pending'} 
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(order.payment_status || 'pending')}>
                      {order.payment_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => openDetailsDialog(order)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openStatusDialog(order)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => printSlips([order as SlipOrder])}
                          className="cursor-pointer"
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Packing slip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <OrderStatusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
        onUpdateStatus={handleStatusUpdate}
      />
      
      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </Card>
  );
}