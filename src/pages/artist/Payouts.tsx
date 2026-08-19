import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';

import { useCurrency } from '@/context/CurrencyContext';
import { useMyArtistProfile } from '@/hooks/useMyArtistProfile';
import { usePayoutsQuery, Payout } from '@/hooks/usePayoutsQuery';
import { useOrdersQuery } from '@/hooks/useOrdersQuery';
import { RequestPayoutDialog } from '@/components/artist/RequestPayoutDialog';
import { PayoutDetailsDialog } from '@/components/artist/PayoutDetailsDialog';
import { PaymentMethodDialog } from '@/components/artist/PaymentMethodDialog';
import { CancelPayoutDialog } from '@/components/artist/CancelPayoutDialog';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
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

export default function Payouts() {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [payoutToCancel, setPayoutToCancel] = useState<{ id: string; amount: number } | null>(null);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const { data: artistProfile } = useMyArtistProfile();
  const { data: payouts = [], isLoading, error } = usePayoutsQuery(artistProfile?.id);
  const { data: orders = [] } = useOrdersQuery({ artistId: artistProfile?.id });

  // Available balance = revenue from this artist's paid orders, minus payouts already
  // requested or completed (so a pending/completed payout isn't counted twice).
  const totalRevenue = orders
    .filter(order => order.payment_status === 'completed' || order.payment_status === 'paid')
    .flatMap(order => order.order_items || [])
    .filter(item => item.artist_id === artistProfile?.id)
    .reduce((sum, item) => sum + Number(item.total_price), 0);

  const reservedAmount = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing' || p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const availableBalance = Math.max(totalRevenue - reservedAmount, 0);
  const totalEarnings = payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const pendingAmount = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, payout) => sum + Number(payout.amount), 0);
  const successRate = payouts.length > 0
    ? Math.round((completedPayouts.length / payouts.length) * 100)
    : 0;

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsDetailsDialogOpen(true);
  };

  const handleCancelPayout = (payout: Payout) => {
    setPayoutToCancel({ id: payout.id, amount: payout.amount });
    setIsCancelDialogOpen(true);
  };

  const handleExportReport = () => {
    const csv = payouts.map(payout =>
      `${payout.id},${payout.created_at},${payout.amount},${payout.status},${payout.payment_method || ''},${payout.payment_reference || ''}`
    ).join('\n');
    const blob = new Blob([`ID,Date,Amount,Status,Method,Reference\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payouts-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export Complete",
      description: "Payouts report has been downloaded",
    });
  };

  const stats = [
    {
      title: "Total Earnings",
      value: formatPrice(totalEarnings),
      icon: DollarSign,
    },
    {
      title: "Completed Payouts",
      value: completedPayouts.length.toString(),
      icon: CheckCircle,
    },
    {
      title: "Pending Amount",
      value: formatPrice(pendingAmount),
      icon: Clock,
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: BarChart3,
    }
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
            <p className="text-muted-foreground">
              Manage your earnings and track payout history
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              Request Payout
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center text-destructive">
              Error loading payouts: {error.message}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payout Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Payouts</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payout History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <p className="text-muted-foreground text-center py-8">Loading payouts…</p>
                    ) : payouts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No payouts yet</p>
                    ) : (
                      payouts.map((payout, index) => {
                        const config = statusConfig[payout.status || 'pending'] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        return (
                          <motion.div
                            key={payout.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 rounded-lg bg-muted">
                                <StatusIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-foreground">
                                    {formatPrice(payout.amount)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={config.color}
                                  >
                                    {payout.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(payout.created_at).toLocaleDateString()}</span>
                                  {payout.payment_method && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{payout.payment_method.replace('_', ' ')}</span>
                                    </>
                                  )}
                                  {payout.payment_reference && (
                                    <>
                                      <span>•</span>
                                      <span>{payout.payment_reference}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {payout.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelPayout(payout)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(payout)}
                              >
                                View Details
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payouts
                      .filter(p => p.status === 'pending')
                      .map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{formatPrice(payout.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              Requested {new Date(payout.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelPayout(payout)}
                          >
                            Cancel Request
                          </Button>
                        </div>
                      ))}
                    {payouts.filter(p => p.status === 'pending').length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No pending payouts</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedPayouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{formatPrice(payout.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            Completed {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : new Date(payout.created_at).toLocaleDateString()}
                            {payout.payment_reference && ` • ${payout.payment_reference}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Completed
                        </Badge>
                      </div>
                    ))}
                    {completedPayouts.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No completed payouts yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Payout Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your payout preferences and methods
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Available Balance</h4>
                  <p className="text-sm text-muted-foreground">
                    Revenue from paid orders not yet requested as a payout
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Balance:</span>
                    <span className="font-medium">{formatPrice(availableBalance)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Payment Method</h4>
                  <p className="text-sm text-muted-foreground">
                    Primary method for receiving payments
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsPaymentMethodDialogOpen(true)}
                  >
                    Manage Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs */}
        {artistProfile && (
          <RequestPayoutDialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
            artistId={artistProfile.id}
            availableBalance={availableBalance}
          />
        )}

        <PayoutDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          payout={selectedPayout}
        />

        <PaymentMethodDialog
          open={isPaymentMethodDialogOpen}
          onOpenChange={setIsPaymentMethodDialogOpen}
        />

        <CancelPayoutDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          payoutId={payoutToCancel?.id || null}
          payoutAmount={payoutToCancel?.amount || 0}
        />
    </div>
  );
}
