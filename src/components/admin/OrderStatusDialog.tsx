import React, { useEffect, useState } from 'react';
import { Mail, MailX } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADMIN_STATUSES, EMAILED_STATUSES, ORDER_FLOW, orderStatusLabel } from '@/lib/orderStatus';

interface StatusDialogOrder {
  id: string;
  order_number: string;
  status: string | null;
  tracking_number: string | null;
  carrier_name?: string | null;
}

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: StatusDialogOrder | null;
  onUpdateStatus: (orderId: string, status: string, trackingNumber?: string, carrierName?: string) => Promise<void> | void;
}

const CANCEL_BEFORE = ORDER_FLOW.indexOf('picked_up');

export function OrderStatusDialog({ open, onOpenChange, order, onUpdateStatus }: OrderStatusDialogProps) {
  const [status, setStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setStatus('');
    setCarrier(order.carrier_name ?? '');
    setTracking(order.tracking_number ?? '');
  }, [order]);

  if (!order) return null;

  const current = ORDER_FLOW.indexOf(order.status ?? '');
  const editable = current >= 0;
  const options = ADMIN_STATUSES.filter((s) =>
    s === 'cancelled' ? current < CANCEL_BEFORE : s !== order.status);

  const forward = status === 'cancelled' || ORDER_FLOW.indexOf(status) > current;
  const willEmail = forward && EMAILED_STATUSES.has(status);
  const needsCarrier = status === 'assigned_to_carrier';
  const canSubmit = status && !saving && (!needsCarrier || (carrier.trim() && tracking.trim()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onUpdateStatus(order.id, status, tracking.trim() || undefined, carrier.trim() || undefined);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>
            Order {order.order_number} is currently <strong>{orderStatusLabel(order.status)}</strong>.
          </DialogDescription>
        </DialogHeader>

        {!editable ? (
          <p className="text-sm text-muted-foreground">
            Orders that are unpaid, cancelled or refunded can't be changed here.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">New status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status"><SelectValue placeholder="Choose a status" /></SelectTrigger>
                <SelectContent>
                  {options.map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusLabel(s)}
                      {s !== 'cancelled' && ORDER_FLOW.indexOf(s) < current ? ' (correction)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(needsCarrier || order.tracking_number) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. GIG Logistics" required={needsCarrier} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking number</Label>
                  <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} required={needsCarrier} />
                </div>
              </div>
            )}

            {status && (
              <p className="flex items-center gap-2 text-sm rounded-md bg-muted px-3 py-2">
                {willEmail
                  ? <><Mail className="h-4 w-4" />The customer will be emailed about this change.</>
                  : <><MailX className="h-4 w-4" />No email will be sent.</>}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={!canSubmit}>
                {saving ? 'Saving…' : status ? `Confirm: ${orderStatusLabel(status)}` : 'Confirm'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
