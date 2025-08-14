
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Upload, DollarSign, Share2, Clock, Zap, BarChart3, Grid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="py-20 lg:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-3">
            <Grid className="h-5 w-5 text-muted-foreground" />
            <span className="text-dashboard-text text-muted-foreground">How it works</span>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Avg. setup: 7 minutes
          </Badge>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-h1 lg:text-h1-lg font-bold text-foreground">
            From idea to shipped—fast
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Step 1: Set up your store */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="h-full border border-border bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-h3 font-bold text-foreground mb-4">
                  1. Set up your store
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      Connect socials, add bio, upload brand assets.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      Pick products (tees, hoodies, hats, more).
                    </span>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/20 rounded p-1">
                      <Zap className="h-3 w-3 text-accent" />
                    </div>
                    <div>
                      <div className="text-dashboard-text font-medium text-foreground mb-1">Tip</div>
                      <div className="text-meta text-muted-foreground">
                        Start with a limited drop to build hype and learn what fans love.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Customize your drop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="h-full border border-border bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-h3 font-bold text-foreground mb-4">
                  2. Customize your drop
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      Upload designs or request a designer assist.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      Set pricing with instant margin previews.
                    </span>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="text-dashboard-text font-medium text-foreground mb-2">Auto-magic</div>
                  <div className="text-meta text-muted-foreground">
                    We generate mockups and size charts automatically for every variant.
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Share and fulfill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="h-full border border-border bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-h3 font-bold text-foreground mb-4">
                  3. Share and fulfill
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      Share your drop link anywhere—X, Instagram, TikTok.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-dashboard-text text-muted-foreground">
                      We handle payments and shipping with live tracking.
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                  <div className="text-dashboard-text font-medium text-foreground mb-2">Outcomes</div>
                  <div className="text-meta text-muted-foreground">
                    Realtime dashboards for orders, revenue, and fan geographies.
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
