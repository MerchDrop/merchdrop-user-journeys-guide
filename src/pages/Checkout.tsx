import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, Shield, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const { formatPrice, convertPrice, currency } = useCurrency();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
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
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = convertPrice(getTotalPrice());
  const shipping = subtotal > 50 ? 0 : convertPrice(8.99);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = [
    { number: 1, title: "Information", icon: Truck },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Complete", icon: Check }
  ];

  const handlePaystackSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount: Math.round(total * 100),
          currency: currency,
          email: formData.email,
          reference: reference.reference,
          items: items.map(item => ({
            productId: item.id,
            artistId: item.artistId || null,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        }
      });

      if (error) throw error;

      setCompletedOrder(data);
      clearCart();
      setCurrentStep(3);
      
      toast({
        title: "Payment Successful!",
        description: `Order ${data.orderNumber} has been confirmed.`,
      });
    } catch (error) {
      Sentry.captureException(error, { tags: { location: 'checkout.handlePaystackSuccess' } });
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Processing Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. You can try again.",
      variant: "destructive",
    });
  };

  // Paystack configuration - using environment variable for public key
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email,
    amount: Math.round(total * 100), // Convert to kobo for NGN or cents for USD
    currency: currency,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_dcBcopgQ8gJyrVz0JzSCguKF",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

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
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
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
                         onClick={() => {
                           initializePayment({ 
                             onSuccess: handlePaystackSuccess, 
                             onClose: handlePaystackClose 
                           });
                         }}
                        className="flex-1"
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
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
                    
                    <h2 className="text-3xl font-bold mb-4">Order Complete!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                    </p>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="font-semibold">Order #{completedOrder.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Confirmation email sent to {formData.email}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to="/order-tracking">Track Order</Link>
                      </Button>
                      <Link to="/" className="flex-1">
                        <Button className="w-full">
                          Continue Shopping
                        </Button>
                      </Link>
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      🎉 You qualify for free shipping!
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