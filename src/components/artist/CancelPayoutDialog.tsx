import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useCancelPayoutMutation } from '@/hooks/usePayoutsQuery';

interface CancelPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payoutId: string | null;
  payoutAmount: number;
}

export function CancelPayoutDialog({
  open,
  onOpenChange,
  payoutId,
  payoutAmount,
}: CancelPayoutDialogProps) {
  const { formatPrice } = useCurrency();
  const cancelPayoutMutation = useCancelPayoutMutation();

  const handleCancel = async () => {
    if (!payoutId) return;

    try {
      await cancelPayoutMutation.mutateAsync(payoutId);
      onOpenChange(false);
    } catch {
      // Error toast is handled by the mutation's onError
    }
  };

  const isSubmitting = cancelPayoutMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cancel Payout Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this payout request?
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {formatPrice(payoutAmount)}
                </p>
                <p className="text-sm text-orange-700">
                  This amount will be returned to your available balance
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">What happens next:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your payout request will be cancelled immediately</li>
              <li>• The amount will be returned to your available balance</li>
              <li>• You can request a new payout anytime</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Keep Request
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Cancel Payout"}
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}