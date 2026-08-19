import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Design {
  id: string;
  title: string;
  description?: string;
  file_urls: string[];
  status: string;
  admin_feedback?: string;
  created_at: string;
  revenue_generated?: number;
  designer?: {
    designer_name: string;
  };
  artist?: {
    artist_name: string;
  };
}

interface DesignApprovalCardProps {
  design: Design;
  onApprove?: (feedback?: string) => void;
  onReject?: (feedback: string) => void;
}

export function DesignApprovalCard({ design, onApprove, onReject }: DesignApprovalCardProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (actionType === 'approve' && onApprove) {
      onApprove(feedback || undefined);
    } else if (actionType === 'reject' && onReject && feedback) {
      onReject(feedback);
    }
    setFeedback('');
    setShowFeedback(false);
    setActionType(null);
  };

  const getStatusBadge = () => {
    switch (design.status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{design.title}</CardTitle>
            <CardDescription>
              By {design.designer?.designer_name} for {design.artist?.artist_name}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {design.file_urls[0] && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-square cursor-pointer group">
                <img
                  src={design.file_urls[0]}
                  alt={design.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{design.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {design.file_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${design.title} - ${idx + 1}`}
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {design.description && (
          <p className="text-sm text-muted-foreground">{design.description}</p>
        )}

        {design.admin_feedback && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Admin Feedback:</p>
            <p className="text-sm text-muted-foreground">{design.admin_feedback}</p>
          </div>
        )}

        {design.revenue_generated && design.revenue_generated > 0 && (
          <p className="text-sm">Revenue: ${design.revenue_generated.toFixed(2)}</p>
        )}
      </CardContent>

      {design.status === 'pending' && onApprove && onReject && (
        <CardFooter className="flex-col gap-2">
          {showFeedback ? (
            <div className="w-full space-y-2">
              <Textarea
                placeholder={actionType === 'reject' ? 'Rejection reason (required)' : 'Optional feedback'}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAction}
                  className="flex-1"
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback('');
                    setActionType(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => {
                  setActionType('approve');
                  setShowFeedback(true);
                }}
                className="flex-1"
                variant="default"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => {
                  setActionType('reject');
                  setShowFeedback(true);
                }}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
