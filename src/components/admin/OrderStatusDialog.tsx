import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order } from '@/hooks/useOrders';
import { Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
}

export function OrderStatusDialog({ open, onOpenChange, order, onUpdateStatus }: OrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStatus === 'shipped' && !trackingNumber.trim()) {
      return; // Don't allow shipping without tracking number
    }

    onUpdateStatus(order.id, selectedStatus, trackingNumber.trim() || undefined);
    onOpenChange(false);
    setTrackingNumber('');
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    { value: 'processing', label: 'Processing', icon: AlertCircle, color: 'text-blue-600' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-orange-600' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600' }
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the status for order #{order.order_number}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Order['status'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus === 'shipped' && (
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                required
              />
              <p className="text-sm text-muted-foreground">
                Tracking number is required when marking order as shipped
              </p>
            </div>
          )}

          {order.tracking_number && selectedStatus !== 'shipped' && (
            <div className="space-y-2">
              <Label>Current Tracking Number</Label>
              <div className="p-2 bg-muted rounded text-sm font-mono">
                {order.tracking_number}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Status
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}