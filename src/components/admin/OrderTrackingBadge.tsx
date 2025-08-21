import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface OrderTrackingBadgeProps {
  trackingNumber: string | null;
  status: string;
}

export function OrderTrackingBadge({ trackingNumber, status }: OrderTrackingBadgeProps) {
  const copyTrackingNumber = async () => {
    if (trackingNumber) {
      try {
        await navigator.clipboard.writeText(trackingNumber);
        toast.success('Tracking number copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy tracking number');
      }
    }
  };

  const openTrackingLink = () => {
    if (trackingNumber) {
      // Generic tracking URL - in a real app, you'd determine the carrier and use their specific tracking URL
      const trackingUrl = `https://www.google.com/search?q=track+package+${trackingNumber}`;
      window.open(trackingUrl, '_blank');
    }
  };

  if (!trackingNumber || (status !== 'shipped' && status !== 'delivered')) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Truck className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono">
          {trackingNumber}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyTrackingNumber}
          className="h-6 w-6 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={openTrackingLink}
          className="h-6 w-6 p-0"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}