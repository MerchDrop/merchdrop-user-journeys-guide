import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrdersQuery';
import { ShoppingCart, Clock, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export function AdminOrdersStats() {
  const { orders, loading } = useOrders();
  const { formatPrice } = useCurrency();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: orders.filter(o => o.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Processing',
      value: orders.filter(o => o.status === 'processing').length,
      icon: Truck,
      color: 'text-orange-600'
    },
    {
      title: 'Delivered',
      value: orders.filter(o => o.status === 'delivered').length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatPrice(orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)),
      icon: DollarSign,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}