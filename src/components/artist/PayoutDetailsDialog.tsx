import React from 'react';
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
import { 
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Copy,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { Payout } from '@/hooks/usePayoutsQuery';

interface PayoutDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: Payout | null;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
  pending: {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Clock
  },
  processing: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: TrendingUp
  },
  completed: {
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle
  },
  failed: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertCircle
  }
};

export function PayoutDetailsDialog({ open, onOpenChange, payout }: PayoutDetailsDialogProps) {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  if (!payout) return null;

  const status = payout.status || 'pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const processingFee = payout.processing_fee ?? payout.amount * 0.025;
  const netAmount = payout.net_amount ?? payout.amount - processingFee;

  const handleCopyReference = () => {
    if (payout.payment_reference) {
      navigator.clipboard.writeText(payout.payment_reference);
      toast({
        title: "Copied",
        description: "Reference number copied to clipboard",
      });
    }
  };

  const handleDownloadReceipt = () => {
    toast({
      title: "Download Started",
      description: "Receipt download will begin shortly",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payout Details
          </DialogTitle>
          <DialogDescription>
            Transaction ID: {payout.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant="outline"
              className={statusConfig.color}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Amount Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gross Amount</span>
              <span className="font-medium">{formatPrice(payout.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Fee</span>
              <span className="text-red-600">-{formatPrice(processingFee)}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Net Amount</span>
              <span>{formatPrice(netAmount)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Method</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">
                {payout.payment_method?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Requested</span>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(payout.created_at)}
              </div>
            </div>
            {payout.processed_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Processed</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {formatDate(payout.processed_at)}
                </div>
              </div>
            )}
          </div>

          {/* Reference Number */}
          {payout.payment_reference && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {payout.payment_reference}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyReference}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}