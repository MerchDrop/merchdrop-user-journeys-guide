import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesigners } from '@/hooks/useDesignersQuery';
import { CreditCard, Calendar, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

export const DesignerPayouts = () => {
  const { payouts, loading } = useDesigners();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPayouts = payouts.filter(payout => 
    statusFilter === 'all' || payout.status === statusFilter
  );

  const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.net_amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.net_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payouts List */}
      <div className="space-y-4">
        {filteredPayouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No payouts found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your payouts will appear here once your designs start earning revenue.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPayouts.map((payout) => (
            <Card key={payout.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        ${payout.amount.toFixed(2)}
                      </h3>
                      <Badge className={getStatusColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">${payout.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Processing Fee</p>
                        <p className="font-medium">-${payout.processing_fee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Amount</p>
                        <p className="font-medium text-green-600">${payout.net_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Currency</p>
                        <p className="font-medium">{payout.currency}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Requested: {format(new Date(payout.created_at), 'MMM dd, yyyy')}
                      </div>
                      {payout.processed_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Processed: {format(new Date(payout.processed_at), 'MMM dd, yyyy')}
                        </div>
                      )}
                      {payout.payment_method && (
                        <div>
                          Method: {payout.payment_method}
                        </div>
                      )}
                    </div>
                    
                    {payout.payment_reference && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          <strong>Reference:</strong> {payout.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                    {payout.status === 'failed' && (
                      <Button variant="outline" size="sm">
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payout Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Payouts are processed monthly on the 15th of each month</p>
            <p>• Minimum payout amount is $50</p>
            <p>• Processing fees may apply depending on your payment method</p>
            <p>• Payouts typically take 3-5 business days to reach your account</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};