import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Truck, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';

// Mock order data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    items: ['Mystic Forest Poster', 'Galaxy Cat T-Shirt'],
    total: 64.98,
    status: 'pending',
    date: '2024-01-20',
    avatar: '/placeholder.svg'
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    items: ['Urban Dreams Print'],
    total: 24.99,
    status: 'processing',
    date: '2024-01-19',
    avatar: '/placeholder.svg'
  },
  {
    id: 'ORD-003',
    customer: 'Bob Wilson',
    items: ['Retro Wave Mug', 'Galaxy Cat T-Shirt'],
    total: 54.98,
    status: 'shipped',
    date: '2024-01-18',
    avatar: '/placeholder.svg'
  },
  {
    id: 'ORD-004',
    customer: 'Alice Brown',
    items: ['Mystic Forest Poster'],
    total: 29.99,
    status: 'delivered',
    date: '2024-01-17',
    avatar: '/placeholder.svg'
  },
];

const statusColumns = [
  {
    id: 'pending',
    title: 'Pending',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    id: 'processing',
    title: 'In Production',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'shipped',
    title: 'Shipped',
    icon: Truck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'delivered',
    title: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  }
];

const OrderCard = ({ order }: { order: any }) => {
  const { formatPrice } = useCurrency();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-move"
    >
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={order.avatar} alt={order.customer} />
                <AvatarFallback>
                  {order.customer.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.id}</p>
              </div>
            </div>
            <Badge variant="secondary">{formatPrice(order.total)}</Badge>
          </div>
          
          <div className="space-y-1 mb-3">
            {order.items.map((item: string, index: number) => (
              <p key={index} className="text-xs text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{order.date}</span>
            <Button size="sm" variant="outline" className="h-6 text-xs px-2">
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FulfillmentBoard = () => {
  const getOrdersByStatus = (status: string) => {
    return mockOrders.filter(order => order.status === status);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Order Fulfillment</h2>
        <p className="text-muted-foreground">Manage order processing and shipping</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const Icon = column.icon;
          const orders = getOrdersByStatus(column.id);
          
          return (
            <Card key={column.id} className={column.bgColor}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className={`h-4 w-4 ${column.color}`} />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {orders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                  {orders.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No orders in this stage
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FulfillmentBoard;