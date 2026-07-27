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
import { 
  DollarSign,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { useRequestPayoutMutation } from '@/hooks/usePayoutsQuery';

interface RequestPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artistId: string;
  availableBalance: number;
}

export function RequestPayoutDialog({ open, onOpenChange, artistId, availableBalance }: RequestPayoutDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const requestPayoutMutation = useRequestPayoutMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const requestAmount = parseFloat(amount);
    if (requestAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Requested amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    if (requestAmount < 50) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum payout amount is " + formatPrice(50),
        variant: "destructive"
      });
      return;
    }

    try {
      await requestPayoutMutation.mutateAsync({ artistId, amount: requestAmount, paymentMethod });
      setAmount('');
      setPaymentMethod('');
      onOpenChange(false);
    } catch {
      // Error toast is handled by the mutation's onError
    }
  };

  const isSubmitting = requestPayoutMutation.isPending;

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote },
    { value: 'paypal', label: 'PayPal', icon: Wallet },
    { value: 'stripe', label: 'Stripe Connect', icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Request a payout from your available balance of {formatPrice(availableBalance)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="50"
              max={availableBalance}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {formatPrice(50)} • Available: {formatPrice(availableBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span>{formatPrice(parseFloat(amount) || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processing Fee (2.5%):</span>
              <span>-{formatPrice((parseFloat(amount) || 0) * 0.025)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>You'll receive:</span>
              <span>{formatPrice((parseFloat(amount) || 0) * 0.975)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Request Payout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}