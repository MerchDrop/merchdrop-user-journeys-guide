import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Calendar } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed';
}

interface PayoutsListProps {
  payouts: Payout[];
  loading?: boolean;
}

const statusVariants = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function PayoutsList({ payouts, loading }: PayoutsListProps) {
  const { formatPrice } = useCurrency();
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payouts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your earnings and payout requests
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {formatPrice(payout.amount)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={statusVariants[payout.status]}
                    >
                      {payout.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(payout.date).toLocaleDateString()}
                  </div>
                </div>
                {payout.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    Request Payout
                  </Button>
                )}
              </motion.div>
            ))}
            
            {payouts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No pending payouts</p>
                <p className="text-sm">Your earnings will appear here when available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}