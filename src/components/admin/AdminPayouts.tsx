import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  CreditCard,
  Building,
  User,
  DollarSign,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPayouts() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [payouts, setPayouts] = useState<any[]>(demoPayouts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');

  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setPayouts(data);
      }
    } catch (e) {
      console.error('Error fetching payouts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = (status: 'paid' | 'rejected') => {
    if (!selectedPayout) return;
    const updated = payouts.map((p) => {
      if (p.id === selectedPayout.id) {
        return {
          ...p,
          status: status,
          processed_at: new Date().toISOString(),
          transaction_ref: transactionRef || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      }
      return p;
    });
    setPayouts(updated);
    setIsProcessDialogOpen(false);
    setSelectedPayout(null);
    setTransactionRef('');
    toast({
      title: status === 'paid' ? 'Payout Released Successfully' : 'Payout Rejected',
      description: `Payout #${selectedPayout.id.slice(0, 8)} marked as ${status}.`,
    });
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesStatus = selectedStatusTab === 'all' || p.status === selectedStatusTab;
    const matchesSearch =
      p.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.account_number.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPaidNGN = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount_ngn || 0), 0);

  const totalPendingNGN = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount_ngn || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            Payouts & Financial Earnings
          </h1>
          <p className="text-muted-foreground mt-1">
            Review creator commission withdrawal requests, inspect bank details, and release payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export Payout Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payouts Released</p>
              <h3 className="text-2xl font-bold mt-2 text-foreground">₦{totalPaidNGN.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payout Requests</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-600">₦{totalPendingNGN.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Count</p>
              <h3 className="text-2xl font-bold mt-2">{payouts.filter((p) => p.status === 'pending').length} Requests</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Creator Revenue</p>
              <h3 className="text-2xl font-bold mt-2">₦{(totalPaidNGN + totalPendingNGN).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Payout Withdrawal Requests</CardTitle>
              <CardDescription>
                Filter payouts by status and process bank transfers to artists and designers.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search creator, bank, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <Tabs defaultValue="all" onValueChange={setSelectedStatusTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payout requests found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-primary">
                        #{payout.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">
                        {payout.creator_name}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payout.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">{payout.bank_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {payout.account_number} ({payout.account_name})
                        </p>
                      </td>
                      <td className="py-4 px-4 font-bold text-foreground">
                        ₦{payout.amount_ngn.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            payout.status === 'paid'
                              ? 'default'
                              : payout.status === 'rejected'
                              ? 'destructive'
                              : 'outline'
                          }
                          className={payout.status === 'paid' ? 'bg-green-600' : ''}
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant={payout.status === 'pending' ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedPayout(payout);
                            setIsProcessDialogOpen(true);
                          }}
                        >
                          {payout.status === 'pending' ? 'Process Payout' : 'View Details'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Process Payout Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Creator Payout</DialogTitle>
            <DialogDescription>
              Confirm payment details before releasing funds to creator.
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted/40 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-bold">{selectedPayout.creator_name} ({selectedPayout.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">{selectedPayout.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono">{selectedPayout.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{selectedPayout.account_name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-base font-bold">
                  <span>Payout Amount:</span>
                  <span className="text-primary">₦{selectedPayout.amount_ngn.toLocaleString()}</span>
                </div>
              </div>

              {selectedPayout.status === 'pending' && (
                <div>
                  <Label htmlFor="txRef">Transaction Reference / Receipt ID</Label>
                  <Input
                    id="txRef"
                    placeholder="e.g. PSTK_PAY_9812409"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedPayout?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleApprovePayout('rejected')}
                >
                  Reject Payout
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprovePayout('paid')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Release Payout
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const demoPayouts = [
  {
    id: 'pay-7701',
    creator_name: 'David Adeleke',
    role: 'artist',
    bank_name: 'Guaranty Trust Bank (GTB)',
    account_number: '0123456789',
    account_name: 'David Adeleke',
    amount_ngn: 150000,
    status: 'pending',
    created_at: '2026-07-26T10:00:00Z',
  },
  {
    id: 'pay-7702',
    creator_name: 'Blessing Arts',
    role: 'designer',
    bank_name: 'Zenith Bank',
    account_number: '2089123456',
    account_name: 'Blessing Okafor',
    amount_ngn: 85000,
    status: 'paid',
    created_at: '2026-07-25T14:30:00Z',
    processed_at: '2026-07-25T16:00:00Z',
  },
  {
    id: 'pay-7703',
    creator_name: 'Wizkid Merch',
    role: 'artist',
    bank_name: 'Access Bank',
    account_number: '0712398471',
    account_name: 'Ayodeji Balogun',
    amount_ngn: 320000,
    status: 'pending',
    created_at: '2026-07-27T08:15:00Z',
  },
];
