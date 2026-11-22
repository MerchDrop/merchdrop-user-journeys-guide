import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, Shield, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { callPayments, couponDiscount, hasPaystackKey, openPaystack, type Coupon } from '@/lib/payments';
import { track } from '@vercel/analytics';
import { useToast } from '@/hooks/use-toast';
import { useShippingAxes, getShippingAxis } from '@/config/shipping';
import { MapPin, Info } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { axes: shippingAxes } = useShippingAxes();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string; orderNumber: string; viewToken: string; status: string; accountCreated: boolean;
  } | null>(null);
  const [selectedAxisId, setSelectedAxisId] = useState<string>('axis-1');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // If cart is empty, redirect to cart page
  if (items.length === 0 && !completedOrder) {
    navigate('/cart');
    return null;
  }

  const selectedAxis = getShippingAxis(selectedAxisId, shippingAxes);
  const rawSubtotalNGN = getTotalPrice();
  const rawShippingNGN = selectedAxis.isCustomQuote ? 0 : selectedAxis.feeNGN;
  // Mirrors the server (process-payment); the server's amount is what gets charged.
  const couponApplies = coupon !== null && rawSubtotalNGN >= coupon.minSpend;
  const rawDiscountNGN = couponApplies ? couponDiscount(coupon, rawSubtotalNGN) : 0;
  const rawTaxNGN = (rawSubtotalNGN - rawDiscountNGN) * 0.075;
  const rawTotalNGN = rawSubtotalNGN - rawDiscountNGN + rawShippingNGN + rawTaxNGN;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const found = await callPayments<Coupon>({ action: 'check_coupon', code });
      if (rawSubtotalNGN < found.minSpend) {
        setCouponError(`This code needs a subtotal of at least ${formatPrice(found.minSpend)}.`);
        setCoupon(null);
      } else {
        setCoupon(found);
      }
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : "That code isn't valid");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const steps = [
    { number: 1, title: "Information", icon: Truck },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Complete", icon: Check }
  ];

  type CompletedOrder = {
    orderId: string;
    orderNumber: string;
    viewToken: string;
    status: string;
    accountCreated: boolean;
  };

  // Confirms payment with the server. The Paystack webhook does the same, so this is only for
  // showing the confirmation page right away; if it fails, the order is still saved by the webhook.
  const verifyPayment = async (reference: string) => {
    setIsProcessing(true);
    try {
      const data = await callPayments<CompletedOrder>({ action: 'verify', reference });
      setCompletedOrder(data);
      track('Purchase', { orderNumber: data.orderNumber, coupon: coupon?.code ?? 'none' });
      clearCart();
      setCurrentStep(3);
    } catch (error) {
      Sentry.captureException(error, { tags: { location: 'checkout.verifyPayment' }, extra: { reference } });
      toast({
        title: "We're confirming your payment",
        description: `If you were charged, your order is safe and you'll get an email shortly. Reference: ${reference}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPayment = async () => {
    const customerEmail = formData.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast({ title: 'Email required', description: 'Enter a valid email address.', variant: 'destructive' });
      setCurrentStep(1);
      return;
    }

    track('Begin payment', { items: items.length });
    setIsProcessing(true);
    try {
      // 1. Server prices the cart and stores a Payment pending order.
      const created = await callPayments<{ reference: string; amountKobo: number }>({
          action: 'create',
          couponCode: couponApplies ? coupon.code : undefined,
          email: customerEmail,
          shippingAxisId: selectedAxisId,
          shippingAddress: { ...formData, email: customerEmail },
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
          })),
      });

      // 2. Dev only: no Paystack key configured. The server refuses this unless ALLOW_TEST_PAYMENTS=true.
      if (!hasPaystackKey()) {
        toast({ title: 'Test checkout mode', description: 'No Paystack key set; simulating payment.' });
        await verifyPayment(created.reference);
        return;
      }

      // 3. Charge exactly what the server calculated.
      await openPaystack({
        email: customerEmail,
        amountKobo: created.amountKobo,
        reference: created.reference,
        onSuccess: verifyPayment,
        onClose: () => {
          setIsProcessing(false);
          toast({ title: 'Payment cancelled', description: 'You can try again whenever you are ready.' });
        },
      });
    } catch (err) {
      Sentry.captureException(err, { tags: { location: 'checkout.handleStartPayment' } });
      setIsProcessing(false);
      toast({
        title: 'Payment error',
        description: err instanceof Error ? err.message : 'Could not start payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Link */}
          <Link to="/cart" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted text-muted-foreground'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-6 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {currentStep === 1 && (
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input 
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      />
                    </div>

                    {/* Delivery Location / Shipping Axis */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-semibold">Delivery Location (Shipping Axis)</Label>
                          <p className="text-xs text-muted-foreground">Select your delivery zone to calculate shipping fees</p>
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          Delivery Zone
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {shippingAxes.filter((axis) => axis.active !== false).map((axis) => {
                          const isSelected = selectedAxisId === axis.id;
                          const feeDisplay = axis.isCustomQuote
                            ? 'Email Quote'
                            : formatPrice(axis.feeNGN);

                          return (
                            <div
                              key={axis.id}
                              onClick={() => setSelectedAxisId(axis.id)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-primary/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="radio"
                                    name="shippingAxis"
                                    checked={isSelected}
                                    onChange={() => setSelectedAxisId(axis.id)}
                                    className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">{axis.name}</span>
                                      {axis.isCustomQuote && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                          Custom Quote
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                      {axis.areas}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-sm font-bold flex-shrink-0 ${axis.isCustomQuote ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                  {feeDisplay}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedAxis.isCustomQuote && selectedAxis.customNotice && (
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2.5">
                          <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{selectedAxis.customNotice}</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => {
                        if (!formData.email || !formData.firstName || !formData.lastName || !formData.address) {
                          toast({
                            title: "Missing Information",
                            description: "Please fill in all required fields.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="coupon">Discount code</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="coupon"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                          placeholder="Enter code"
                          className="uppercase"
                          aria-describedby="coupon-status"
                          disabled={isProcessing || coupon !== null}
                        />
                        {coupon ? (
                          <Button type="button" variant="outline" disabled={isProcessing}
                            onClick={() => { setCoupon(null); setCouponInput(''); }}>Remove</Button>
                        ) : (
                          <Button type="button" variant="outline" onClick={applyCoupon}
                            disabled={checkingCoupon || isProcessing || !couponInput.trim()}>
                            {checkingCoupon ? 'Checking…' : 'Apply'}
                          </Button>
                        )}
                      </div>
                      <p id="coupon-status" role="status" className="text-sm mt-1 min-h-5">
                        {couponError && <span className="text-destructive">{couponError}</span>}
                        {couponApplies && (
                          <span className="text-green-700 dark:text-green-400">
                            {coupon.code} applied: you save {formatPrice(rawDiscountNGN)}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(rawSubtotalNGN)}</span>
                        </div>
                        {rawDiscountNGN > 0 && (
                          <div className="flex justify-between text-green-700 dark:text-green-400">
                            <span>Discount ({coupon?.code})</span>
                            <span>−{formatPrice(rawDiscountNGN)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <span>Shipping</span>
                            <p className="text-xs text-muted-foreground">{selectedAxis.name}</p>
                          </div>
                          <span className="font-medium">
                            {selectedAxis.isCustomQuote
                              ? 'Email Quote'
                              : formatPrice(rawShippingNGN)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT / Tax (7.5%)</span>
                          <span>{formatPrice(rawTaxNGN)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatPrice(rawTotalNGN)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure payment powered by Paystack</span>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleStartPayment}
                        className="flex-1"
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Pay ${formatPrice(rawTotalNGN)}`}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {currentStep === 3 && completedOrder && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-white" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-2">Thank you for your order!</h2>
                    <p className="text-muted-foreground mb-6">
                      Payment received. We'll email you at <strong>{formData.email}</strong> as your order moves along.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-muted-foreground">Order number</p>
                      <p className="font-semibold text-lg">{completedOrder.orderNumber}</p>
                    </div>

                    {!user && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6 text-left">
                        {completedOrder.accountCreated ? (
                          <>
                            <p className="font-semibold">We've created an account for you</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Check your email for a link to set your password. You'll be able to track this and future orders under Orders.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">This order has been added to your account</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <Link to="/user-auth" className="underline">Sign in</Link> to track it under Orders.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/order/${completedOrder.orderId}?token=${completedOrder.viewToken}`}>Track order</Link>
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link to="/">Continue shopping</Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 sticky top-8">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-cover bg-center rounded-lg" 
                           style={{ backgroundImage: `url(${item.image || '/placeholder.svg'})` }} />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">by {item.artist || 'Unknown Artist'}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {item.size && <Badge variant="outline">{item.size}</Badge>}
                          {item.color && <Badge variant="outline">{item.color}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-6 space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(rawSubtotalNGN)}</span>
                  </div>
                  {rawDiscountNGN > 0 && (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span>Discount ({coupon?.code})</span>
                      <span>−{formatPrice(rawDiscountNGN)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <span>Shipping</span>
                      <p className="text-xs text-muted-foreground">
                        {selectedAxis.name} ({selectedAxis.areas})
                      </p>
                    </div>
                    <span className="font-semibold text-right">
                      {selectedAxis.isCustomQuote
                        ? 'Email Quote'
                        : formatPrice(rawShippingNGN)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT / Tax (7.5%)</span>
                    <span>{formatPrice(rawTaxNGN)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(rawTotalNGN)}</span>
                  </div>
                </div>

                {selectedAxis.isCustomQuote && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                      📌 Delivery fee will be calculated based on your address and emailed prior to dispatch.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}