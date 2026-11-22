import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, MapPin, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { ORDER_FLOW, orderStatusLabel, orderStatusTone } from '@/lib/orderStatus';

interface OrderDetails {
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    created_at: string;
    carrier_name: string | null;
    tracking_number: string | null;
    shipping_address: Record<string, string>;
  };
  items: {
    id: string;
    title: string | null;
    image: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    variant: { size?: string | null; color?: string | null } | null;
  }[];
  history: { status: string; at: string }[];
}

const OFF_PATH: Record<string, string> = {
  payment_pending: 'We are waiting for your payment to be confirmed.',
  payment_failed: "Your payment didn't go through, so this order wasn't placed.",
  cancelled: 'This order was cancelled.',
  refunded: 'This order was refunded.',
};

/** Steps already reached on the normal path, with the time each was reached. */
function timeline(details: OrderDetails) {
  const reachedAt = new Map<string, string>();
  for (const h of details.history) reachedAt.set(h.status, h.at); // latest wins after corrections
  const current = ORDER_FLOW.indexOf(details.order.status);
  return ORDER_FLOW.map((status, i) => ({
    status,
    done: current >= 0 && i <= current,
    at: current >= 0 && i <= current ? reachedAt.get(status) : undefined,
  }));
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    supabase
      .rpc('get_order_details' as never, { p_order_id: orderId, p_token: token } as never)
      .then(({ data, error }) => {
        if (error) console.error('Order lookup failed:', error.message);
        setDetails((data as OrderDetails | null) ?? null);
        setLoading(false);
      });
  }, [orderId, token, user?.id]);

  if (loading || !details) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {loading ? (
            <div className="animate-pulse space-y-6" aria-busy="true">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-3">Order not found</h1>
              <p className="text-muted-foreground mb-6">
                {user
                  ? "This order isn't on your account. Use the link in your order email to view it."
                  : 'Sign in, or use the "View your order" link in your order email.'}
              </p>
              <Button asChild><Link to={user ? '/orders' : '/user-auth'}>{user ? 'My orders' : 'Sign in'}</Link></Button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const { order, items } = details;
  const addr = order.shipping_address ?? {};
  const offPath = OFF_PATH[order.status];
  const trackingUrl = order.tracking_number
    ? `https://www.google.com/search?q=${encodeURIComponent(`${order.carrier_name ?? ''} tracking ${order.tracking_number}`)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {user && (
          <Button variant="ghost" asChild className="mb-4 -ml-3">
            <Link to="/orders"><ArrowLeft className="w-4 h-4 mr-2" />My orders</Link>
          </Button>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Order</p>
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">Placed {format(new Date(order.created_at), 'MMM d, yyyy')}</p>
          </div>
          <Badge className={`text-sm px-3 py-1 w-fit ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent>
                {offPath ? (
                  <p className="flex items-start gap-3 text-muted-foreground">
                    <XCircle className="w-5 h-5 mt-0.5 text-red-500 shrink-0" />{offPath}
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {timeline(details).map((step) => (
                      <li key={step.status} className="flex items-center gap-3">
                        {step.done
                          ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          : <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />}
                        <span className={`flex-1 ${step.done ? 'font-medium' : 'text-muted-foreground'}`}>
                          {orderStatusLabel(step.status)}
                        </span>
                        {step.at && (
                          <time className="text-sm text-muted-foreground" dateTime={step.at}>
                            {format(new Date(step.at), 'MMM d, h:mm a')}
                          </time>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Items</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const variant = [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image || '/placeholder.svg'} alt="" width={64} height={64}
                        className="w-16 h-16 object-cover rounded-lg bg-muted" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.title ?? 'Item'}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant && `${variant} · `}Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(Number(item.total_price))}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Delivery</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  {[`${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim(), addr.address, addr.city, addr.state]
                    .filter(Boolean).join(', ')}
                </p>
                {order.tracking_number && (
                  <div>
                    <p className="font-semibold">{order.carrier_name}</p>
                    <p className="font-mono bg-muted p-2 rounded mt-1">{order.tracking_number}</p>
                    {trackingUrl && (
                      <a href={trackingUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 underline">
                        Track with carrier <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(Number(order.shipping_cost))}</span></div>
                <div className="flex justify-between"><span>VAT</span><span>{formatPrice(Number(order.tax_amount))}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span><span>{formatPrice(Number(order.total_amount))}</span>
                </div>
                <p className="text-muted-foreground pt-1">Payment: {order.payment_status}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
