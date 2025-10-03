import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductDesignSelection {
  id: string;
  status: string;
  product_details: any;
  admin_feedback?: string;
  created_at: string;
  design?: {
    id: string;
    title: string;
    file_urls: string[];
  };
  artist?: {
    id: string;
    artist_name: string;
  };
}

interface ProductDesignApprovalCardProps {
  selection: ProductDesignSelection;
}

export function ProductDesignApprovalCard({ selection }: ProductDesignApprovalCardProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('product_design_selections')
        .update({
          status: 'approved',
          admin_feedback: feedback || undefined,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selection.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-design-selections'] });
      toast.success('Product selection approved');
      setShowFeedback(false);
      setFeedback('');
    },
    onError: () => {
      toast.error('Failed to approve selection');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('product_design_selections')
        .update({
          status: 'rejected',
          admin_feedback: feedback,
        })
        .eq('id', selection.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-design-selections'] });
      toast.success('Product selection rejected');
      setShowFeedback(false);
      setFeedback('');
    },
    onError: () => {
      toast.error('Failed to reject selection');
    },
  });

  const handleAction = () => {
    if (actionType === 'approve') {
      approveMutation.mutate();
    } else if (actionType === 'reject' && feedback) {
      rejectMutation.mutate();
    }
  };

  const getStatusBadge = () => {
    switch (selection.status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {selection.design?.title}
            </CardTitle>
            <CardDescription>
              Selected by {selection.artist?.artist_name}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {selection.design?.file_urls[0] && (
          <img
            src={selection.design.file_urls[0]}
            alt={selection.design.title}
            className="w-full aspect-square object-cover rounded-lg"
          />
        )}

        <div className="bg-muted p-3 rounded-lg space-y-2">
          <p className="text-sm font-medium">Product Details:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(selection.product_details, null, 2)}
          </pre>
        </div>

        {selection.admin_feedback && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Admin Feedback:</p>
            <p className="text-sm text-muted-foreground">{selection.admin_feedback}</p>
          </div>
        )}
      </CardContent>

      {selection.status === 'pending' && (
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
                  disabled={actionType === 'reject' && !feedback}
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
