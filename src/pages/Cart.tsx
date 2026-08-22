import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { getProductUrl } from '@/lib/slug-utils';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-black mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
                <Link to="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Link */}
          <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-black mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link 
                              to={getProductUrl(item)}
                              className="font-semibold text-black hover:text-gray-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600">{item.artist}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Variants */}
                        {(item.size || item.color) && (
                          <div className="flex gap-4 text-sm text-gray-600 mb-3">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black">{formatPrice(item.price)}</span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

                  {/* Order Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-xs text-muted-foreground italic">
                        Calculated at checkout
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT / Tax (7.5%)</span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Estimated Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground text-right">
                        Excludes delivery fee (selected at checkout)
                      </p>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <Link to="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  {/* Security Notice */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Secure checkout with SSL encryption
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}