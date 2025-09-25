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
import { RequestPayoutDialog } from '@/components/artist/RequestPayoutDialog';
import { PayoutDetailsDialog } from '@/components/artist/PayoutDetailsDialog';
import { PaymentMethodDialog } from '@/components/artist/PaymentMethodDialog';
import { CancelPayoutDialog } from '@/components/artist/CancelPayoutDialog';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  reference?: string;
}

const mockPayouts: Payout[] = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 1250.00,
    status: "pending",
    method: "bank_transfer",
  },
  {
    id: "2", 
    date: "2024-01-01",
    amount: 890.50,
    status: "completed",
    method: "bank_transfer",
    reference: "TXN-2024-001"
  },
  {
    id: "3",
    date: "2023-12-15", 
    amount: 650.75,
    status: "completed",
    method: "paypal",
    reference: "TXN-2023-045"
  },
  {
    id: "4",
    date: "2023-12-01",
    amount: 1100.25,
    status: "processing",
    method: "stripe"
  }
];

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

export default function Payouts() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [payouts, setPayouts] = useState(mockPayouts);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [payoutToCancel, setPayoutToCancel] = useState<{ id: string; amount: number } | null>(null);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const pendingAmount = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, payout) => sum + payout.amount, 0);
  const availableBalance = 2450.75; // Mock available balance

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsDetailsDialogOpen(true);
  };

  const handleCancelPayout = (payout: Payout) => {
    setPayoutToCancel({ id: payout.id, amount: payout.amount });
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = (payoutId: string) => {
    setPayouts(prevPayouts => 
      prevPayouts.filter(payout => payout.id !== payoutId)
    );
  };

  const handleExportReport = () => {
    const csv = payouts.map(payout => 
      `${payout.id},${payout.date},${payout.amount},${payout.status},${payout.method},${payout.reference || ''}`
    ).join('\n');
    const blob = new Blob([`ID,Date,Amount,Status,Method,Reference\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payouts-report.csv';
    a.click();
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
      trend: "+12.5%"
    },
    {
      title: "Completed Payouts",
      value: completedPayouts.length.toString(),
      icon: CheckCircle,
      trend: "+3"
    },
    {
      title: "Pending Amount",
      value: formatPrice(pendingAmount),
      icon: Clock,
      trend: formatPrice(pendingAmount)
    },
    {
      title: "Success Rate",
      value: "98.5%",
      icon: BarChart3,
      trend: "+2.1%"
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
            <Button onClick={() => setIsRequestDialogOpen(true)}>Request Payout</Button>
          </div>
        </div>

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
                  <p className="text-xs text-green-600 mt-1">
                    {stat.trend} from last month
                  </p>
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
                    {payouts.map((payout, index) => {
                      const StatusIcon = statusConfig[payout.status].icon;
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
                                  className={statusConfig[payout.status].color}
                                >
                                  {payout.status}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground space-x-2">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(payout.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="capitalize">{payout.method.replace('_', ' ')}</span>
                                {payout.reference && (
                                  <>
                                    <span>•</span>
                                    <span>{payout.reference}</span>
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
                    })}
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
                              Requested {new Date(payout.date).toLocaleDateString()}
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
                            Completed {new Date(payout.date).toLocaleDateString()}
                            {payout.reference && ` • ${payout.reference}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Completed
                        </Badge>
                      </div>
                    ))}
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
                  <h4 className="font-medium">Auto Payout</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically request payouts when balance reaches threshold
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Threshold:</span>
                    <span className="font-medium">{formatPrice(1000)}</span>
                  </div>
                  <Progress value={75} className="h-2" />
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
                    Bank Transfer (••••1234)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs */}
        <RequestPayoutDialog
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
          availableBalance={availableBalance}
        />

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
          onCancel={handleConfirmCancel}
        />
    </div>
  );
}