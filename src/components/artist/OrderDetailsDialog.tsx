import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  User, 
  Calendar,
  DollarSign,
  Truck,
  Mail,
  Printer,
  Edit3,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
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

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (orderId: string, status: string, trackingNumber?: string) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange, onStatusUpdate }: OrderDetailsDialogProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  if (!order) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleStatusUpdate = () => {
    if (!selectedStatus || !order) return;
    
    // Update the order status via callback
    onStatusUpdate?.(order.id, selectedStatus, trackingNumber || undefined);
    
    toast({
      title: "Status Updated",
      description: `Order status changed to ${selectedStatus}`,
    });
    setIsEditingStatus(false);
    setSelectedStatus('');
    setTrackingNumber('');
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast({
      title: "Copied",
      description: "Order number copied to clipboard",
    });
  };

  const handlePrintOrder = () => {
    // TODO: Implement print functionality
    toast({
      title: "Print",
      description: "Print functionality not implemented yet",
    });
  };

  const handleContactCustomer = () => {
    // TODO: Open email client or contact modal
    toast({
      title: "Contact Customer",
      description: "Contact functionality not implemented yet",
    });
  };

  const getOrderProgress = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Order {order.order_number}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderNumber}
                  className="h-6 w-6 p-0 text-white/80 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <DialogDescription className="text-white/80 mt-1">
                Placed on {formatDate(order.created_at)}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Order Progress & Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Progress</h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getOrderProgress()}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pending</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 text-blue-600" />
                Customer Information
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Customer Name</Label>
                  <p className="font-semibold">{order.customer_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.customer_email}</p>
                    <Button variant="ghost" size="sm" onClick={handleContactCustomer} className="h-6 w-6 p-0">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-purple-600" />
                Product Details
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Product Name</Label>
                  <p className="font-semibold">{order.product_title}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                    <p className="font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Unit Price</Label>
                    <p className="font-semibold">{formatPrice(order.total_amount / order.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-green-600" />
              Order Timeline
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Order Placed</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                </div>
                {order.shipped_at && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Shipped</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(order.shipped_at)}</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Delivered</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(order.delivered_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Financial Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              Payment Information
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{formatPrice(order.total_amount)}</div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Edit3 className="h-5 w-5 text-orange-600" />
                Order Management
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 space-y-4">
              {isEditingStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Update Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedStatus === 'shipped' && (
                      <div>
                        <Label htmlFor="tracking">Tracking Number</Label>
                        <Input
                          id="tracking"
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleStatusUpdate} size="sm">
                      Update Status
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingStatus(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingStatus(true)} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                  <Button variant="outline" onClick={handlePrintOrder} size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Order
                  </Button>
                  <Button variant="outline" onClick={handleContactCustomer} size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Customer
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}