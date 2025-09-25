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

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  reference?: string;
  processingFee?: number;
  netAmount?: number;
  processedAt?: string;
  failureReason?: string;
}

interface PayoutDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: Payout | null;
}

export function PayoutDetailsDialog({ open, onOpenChange, payout }: PayoutDetailsDialogProps) {
  const { toast } = useToast();

  if (!payout) return null;

  const statusConfig = {
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

  const StatusIcon = statusConfig[payout.status].icon;
  const processingFee = payout.processingFee || payout.amount * 0.025;
  const netAmount = payout.netAmount || payout.amount - processingFee;

  const handleCopyReference = () => {
    if (payout.reference) {
      navigator.clipboard.writeText(payout.reference);
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

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge 
              variant="outline" 
              className={statusConfig[payout.status].color}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Amount Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gross Amount</span>
              <span className="font-medium">${payout.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Fee</span>
              <span className="text-red-600">-${processingFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Net Amount</span>
              <span>${netAmount.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Method</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">
                {payout.method.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Requested</span>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(payout.date)}
              </div>
            </div>
            {payout.processedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Processed</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {formatDate(payout.processedAt)}
                </div>
              </div>
            )}
          </div>

          {/* Reference Number */}
          {payout.reference && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {payout.reference}
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

          {/* Failure Reason */}
          {payout.status === 'failed' && payout.failureReason && (
            <>
              <Separator />
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Failed</p>
                    <p className="text-xs text-red-600 mt-1">
                      {payout.failureReason}
                    </p>
                  </div>
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
              disabled={payout.status !== 'completed'}
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