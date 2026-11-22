import { useState } from 'react';
import { format } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RETURN_WINDOW_MS = 7 * 24 * 3600 * 1000;

const MESSAGES: Record<string, string> = {
  not_found: "We couldn't find this order. Try the link in your order email.",
  already_requested: "You've already asked to return this order.",
  not_eligible: 'The 7-day return window for this order has closed.',
  reason_required: 'Tell us briefly why you want to return it.',
};

interface ReturnRequestProps {
  orderId: string;
  token: string | null;
  status: string;
  deliveredAt: string | null;
  returnRequestedAt: string | null;
  onRequested: () => void;
}

/** "Request a return" for delivered orders within 7 days; shows the request once made. */
export function ReturnRequest({ orderId, token, status, deliveredAt, returnRequestedAt, onRequested }: ReturnRequestProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  if (returnRequestedAt) {
    return (
      <p className="flex items-start gap-2 text-sm rounded-md bg-muted px-3 py-2">
        <RotateCcw className="h-4 w-4 mt-0.5 shrink-0" />
        You asked to return this order on {format(new Date(returnRequestedAt), 'MMM d')}. We'll email you about next steps.
      </p>
    );
  }

  const eligible = status === 'delivered' && deliveredAt !== null
    && Date.now() - Date.parse(deliveredAt) < RETURN_WINDOW_MS;
  if (!eligible) return null;

  const submit = async () => {
    setSending(true);
    const { data, error } = await supabase.rpc('request_return', { p_order_id: orderId, p_token: token, p_reason: reason });
    setSending(false);
    if (error || data !== 'ok') {
      toast({
        title: "Couldn't send your request",
        description: MESSAGES[String(data)] ?? 'Please try again, or reply to your order email.',
        variant: 'destructive',
      });
      return;
    }
    setOpen(false);
    toast({ title: 'Return requested', description: "We'll email you about next steps." });
    onRequested();
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <RotateCcw className="h-4 w-4 mr-2" />Request a return
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a return</DialogTitle>
            <DialogDescription>
              You can return items within 7 days of delivery. We'll reply by email with how to send them back.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-6">
            <Label htmlFor="return-reason">What's wrong?</Label>
            <Textarea
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wrong size, arrived damaged"
              maxLength={1000}
              rows={4}
            />
          </div>
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={sending || reason.trim().length < 3}>
              {sending ? 'Sending…' : 'Send request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
