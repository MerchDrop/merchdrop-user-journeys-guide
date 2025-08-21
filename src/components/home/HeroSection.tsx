import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from './SearchBar';
import HeroBackground from './HeroBackground';
const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-20 lg:py-32">
      <HeroBackground />
      
      {/* Main Content Container - centered and constrained width */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge and Headline */}
          <div className="mb-12">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Launch your merch line in minutes
            </Badge>
            
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
              MerchDrop launches design, you create, sell, and manage. 
              <br />
              <span className="text-accent">No upfront. No software.</span>
            </h1>
            
            <p className="text-[16px] lg:text-[18px] text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create your online store that sells custom swag, from t-shirts to mugs. 
              Quality on-demand products, global shipping, and instant payouts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="btn-primary text-base px-8 py-4">
              Start a drop
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              See how it works
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>10k+ creators already selling</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>$2M+ revenue generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.9/5 creator satisfaction</span>
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative bg-white rounded-lg shadow-design-card p-8 border border-border">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-[20px] font-semibold text-foreground mb-2">
                  📊 Live Dashboard
                </div>
                <div className="text-[14px] text-muted-foreground mb-4">
                  Track your sales in real-time
                </div>
                <div className="inline-flex items-center text-2xl font-bold text-foreground">
                  <TrendingUp className="h-6 w-6 mr-2 text-accent" />
                  1,342 orders
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;