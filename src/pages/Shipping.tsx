import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Globe, Clock } from 'lucide-react';

export default function Shipping() {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      time: "5-7 business days",
      cost: "$4.99",
      icon: Package
    },
    {
      name: "Express Shipping",
      time: "2-3 business days",
      cost: "$9.99",
      icon: Truck
    },
    {
      name: "International",
      time: "7-14 business days",
      cost: "$12.99+",
      icon: Globe
    }
  ];

  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="Shipping Information - Fast & Reliable Delivery | MerchDrop"
        description="Learn about our shipping options, delivery times, and costs. Fast, reliable shipping worldwide for all your custom merchandise orders."
        keywords="shipping, delivery, shipping costs, international shipping"
      />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-xl text-muted-foreground">Fast, reliable delivery worldwide</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {shippingOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <Icon className="h-12 w-12 mx-auto text-primary mb-4" />
                      <CardTitle>{option.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {option.time}
                        </div>
                        <div className="text-lg font-semibold">{option.cost}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    All orders are processed within 2-3 business days. Custom orders with 
                    personalization may take an additional 1-2 days.
                  </p>
                  <p>
                    Orders placed after 2 PM EST will be processed the next business day.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Order Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    You'll receive a tracking number via email once your order ships. 
                    Track your package in real-time using our order tracking system.
                  </p>
                  <p>
                    For any shipping issues, contact our support team and we'll resolve 
                    it quickly.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>International Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We ship to over 50 countries worldwide. International orders may 
                    be subject to customs fees and import duties.
                  </p>
                  <p>
                    Delivery times vary by destination and may take longer during 
                    peak seasons.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Returns & Exchanges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We offer hassle-free returns within 30 days of delivery. 
                    Items must be in original condition.
                  </p>
                  <p>
                    Custom or personalized items are not eligible for returns 
                    unless there's a quality issue.
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