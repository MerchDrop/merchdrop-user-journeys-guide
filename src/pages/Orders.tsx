import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { isStalePending, orderStatusLabel, orderStatusTone } from '@/lib/orderStatus';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: { quantity: number; products: { title: string; main_image_url: string | null } | null }[];
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at, order_items(quantity, products(title, main_image_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Orders load failed:', error.message);
          setError(true);
          return;
        }
        setOrders(((data ?? []) as unknown as OrderRow[]).filter((o) => !isStalePending(o)));
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Orders</h1>

        {!authLoading && !user ? (
          <Card className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">Sign in to see your orders.</p>
            <Button asChild><Link to="/user-auth">Sign in</Link></Button>
          </Card>
        ) : error ? (
          <p className="text-muted-foreground">We couldn't load your orders. Please refresh the page.</p>
        ) : orders === null ? (
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-10 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild><Link to="/">Start shopping</Link></Button>
          </Card>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const first = order.order_items[0]?.products;
              const more = order.order_items.length - 1;
              return (
                <li key={order.id}>
                  <Link to={`/order/${order.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <img src={first?.main_image_url || '/placeholder.svg'} alt="" width={64} height={64}
                      className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {first?.title ?? 'Order'}{more > 0 && <span className="text-muted-foreground font-normal"> +{more} more</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_number} · {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-semibold">{formatPrice(Number(order.total_amount))}</p>
                      <Badge className={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
