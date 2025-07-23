import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Palette, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Create Your Profile",
      description: "Sign up and set up your artist profile with your bio, social links, and portfolio.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Palette,
      title: "Design Your Merch",
      description: "Upload your own designs, choose from our library, or collaborate with our designers.",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: DollarSign,
      title: "Set Your Prices",
      description: "Choose your pricing strategy and earn 50% of the profits from every sale.",
      color: "bg-success/10 text-success"
    },
    {
      icon: TrendingUp,
      title: "Track & Earn",
      description: "Monitor your sales, track performance, and receive monthly payouts directly to your account.",
      color: "bg-warning/10 text-warning"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="bg-hero-gradient bg-clip-text text-transparent">MerchDrop</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From idea to income in four simple steps. Start your creator journey today with zero upfront costs.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className={`hover-lift animate-fade-in-up delay-${index + 1}00`}>
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="bg-hero-gradient text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 mx-auto">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${step.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Split Info */}
        <div className="bg-card-gradient rounded-2xl p-8 mb-12 border shadow-card">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Transparent Revenue Sharing</h3>
            <p className="text-muted-foreground">See exactly how much you'll earn from every sale</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-accent">50%</span>
              </div>
              <h4 className="font-semibold mb-1">Artist</h4>
              <p className="text-sm text-muted-foreground">Your earnings</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">25%</span>
              </div>
              <h4 className="font-semibold mb-1">Platform</h4>
              <p className="text-sm text-muted-foreground">Operations & tech</p>
            </div>
            <div className="text-center">
              <div className="bg-warning/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-warning">15%</span>
              </div>
              <h4 className="font-semibold mb-1">Marketing</h4>
              <p className="text-sm text-muted-foreground">Promotion & growth</p>
            </div>
            <div className="text-center">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-muted-foreground">10%</span>
              </div>
              <h4 className="font-semibold mb-1">Designer</h4>
              <p className="text-sm text-muted-foreground">When applicable</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/signup">
              Start Your Creator Journey
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;