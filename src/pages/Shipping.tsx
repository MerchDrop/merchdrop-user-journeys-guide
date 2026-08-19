import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Info } from 'lucide-react';
import { useShippingAxes } from '@/config/shipping';
import { useCurrency } from '@/context/CurrencyContext';

export default function Shipping() {
  const { formatPrice, convertBetweenCurrencies, currency } = useCurrency();
  const { axes: shippingAxes } = useShippingAxes();

  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet
        title="Shipping & Delivery Rates | MerchDrop"
        description="View our complete shipping structure, covered delivery zones, and axis rates for your merchandise orders."
        keywords="shipping, delivery fees, lagos delivery, merchdrop shipping, axis shipping"
      />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shipping & Delivery Rates</h1>
            <p className="text-xl text-muted-foreground">
              Select your delivery axis during checkout for automatic fee calculation
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Delivery Axis Table Card */}
            <Card className="overflow-hidden border shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Delivery Fee Structure</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our clear axis-based delivery system across locations
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 text-sm font-normal">
                    <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                    Zonal Rates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="py-3.5 px-6">Shipping Axis</th>
                        <th className="py-3.5 px-6">Areas Covered</th>
                        <th className="py-3.5 px-6 text-right">Delivery Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {shippingAxes.filter((axis) => axis.active !== false).map((axis) => {
                        const feeFormatted = axis.isCustomQuote
                          ? 'Email Quote'
                          : formatPrice(convertBetweenCurrencies(axis.feeNGN, 'NGN', currency));

                        return (
                          <tr key={axis.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-6 font-semibold text-foreground whitespace-nowrap">
                              {axis.name}
                            </td>
                            <td className="py-4 px-6 text-muted-foreground">{axis.areas}</td>
                            <td className="py-4 px-6 text-right font-bold text-foreground whitespace-nowrap">
                              {axis.isCustomQuote ? (
                                <span className="text-amber-600 dark:text-amber-400">Calculated Post-Order</span>
                              ) : (
                                <span>{feeFormatted} <span className="text-xs font-normal text-muted-foreground">(₦{axis.feeNGN.toLocaleString()})</span></span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Notice box for unlisted locations */}
                <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-3">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-amber-900 dark:text-amber-200">Other Locations</h4>
                    <p className="leading-relaxed">
                      Shipping fee will be calculated based on your delivery address. Once your order is ready, the shipping cost will be sent to your email before dispatch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Policy Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing & Handling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    All orders are processed within 2-3 business days. Custom prints or personalized merch may take an additional 1-2 business days for quality check.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    You will receive order updates and dispatch tracking notifications via email once your merchandise is ready.
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