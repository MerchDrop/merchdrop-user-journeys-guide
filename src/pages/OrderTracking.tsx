import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { formatPrice } = useCurrency();
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock order data - in real app, fetch from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderData({
        id: orderId,
        status: 'shipped',
        orderDate: '2024-01-15',
        estimatedDelivery: '2024-01-22',
        shippingAddress: '123 Main St, Anytown, ST 12345',
        trackingNumber: 'TRK123456789',
        items: [
          {
            id: 1,
            name: 'Midnight Vibes Hoodie',
            artist: 'Luna Rivers',
            size: 'M',
            quantity: 1,
            price: 55,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150&h=150&fit=crop'
          },
          {
            id: 2,
            name: 'Ethereal Dreams Tee',
            artist: 'Luna Rivers',
            size: 'L',
            quantity: 2,
            price: 35,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop'
          }
        ],
        timeline: [
          {
            status: 'pending',
            title: 'Order Placed',
            description: 'Your order has been received and is being processed',
            date: '2024-01-15',
            completed: true
          },
          {
            status: 'processing', 
            title: 'In Production',
            description: 'Your items are being printed and prepared',
            date: '2024-01-17',
            completed: true
          },
          {
            status: 'shipped',
            title: 'Shipped',
            description: 'Your order is on its way!',
            date: '2024-01-19',
            completed: true
          },
          {
            status: 'delivered',
            title: 'Delivered',
            description: 'Package delivered successfully',
            date: null,
            completed: false
          }
        ]
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderId]);

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-gray-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find an order with ID: {orderId}
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order #{orderData.id}</h1>
                <p className="text-muted-foreground">
                  Placed on {new Date(orderData.orderDate).toLocaleDateString()}
                </p>
              </div>
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(orderData.status)}`}>
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Timeline */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderData.timeline.map((step: any, index: number) => (
                      <motion.div
                        key={step.status}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(step.status, step.completed)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.title}
                            </h3>
                            {step.date && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(step.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${step.completed ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.items.map((item: any) => (
                      <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {item.artist} • Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Details */}
            <div className="space-y-6">
              {/* Shipping Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Shipping Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {orderData.shippingAddress}
                    </p>
                  </div>
                  
                  {orderData.trackingNumber && (
                    <div>
                      <h4 className="font-semibold mb-1">Tracking Number</h4>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {orderData.trackingNumber}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Estimated Delivery
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Track with Carrier
                  </Button>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatPrice(8.99)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatPrice(12.40)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatPrice(orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 8.99 + 12.40)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;