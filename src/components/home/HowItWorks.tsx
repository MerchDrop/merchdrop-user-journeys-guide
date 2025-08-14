
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
      title: "Upload Your Art",
      description: "Simply upload your designs and we'll handle the rest. Support for various file formats and high-resolution artwork.",
      step: "01"
    },
    {
      icon: Palette,
      title: "Choose Products",
      description: "Select from our premium product catalog. T-shirts, hoodies, posters, and more - all ready for your designs.",
      step: "02"
    },
    {
      icon: DollarSign,
      title: "Set Your Price",
      description: "You control the pricing and profit margins. Our transparent system shows exactly what you'll earn per sale.",
      step: "03"
    },
    {
      icon: TrendingUp,
      title: "Track & Earn",
      description: "Monitor your sales in real-time and receive automatic payouts. Focus on creating while we handle the business.",
      step: "04"
    }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="py-20 lg:py-32 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-h2 lg:text-h2-lg font-bold mb-6 text-foreground">
            From idea to shipped—fast
          </h2>
          <p className="text-body lg:text-body-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Four simple steps to turn your creativity into a revenue stream. 
            No upfront costs, no inventory management, no hassle.
          </p>
        </motion.div>

        {/* Steps Grid - horizontal layout like reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="step-card bg-white p-6 rounded-lg shadow-design-card border border-border hover:shadow-design-hover transition-design-smooth">
                {/* Step Number Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <step.icon className="h-6 w-6 text-foreground" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-dashboard-title lg:text-dashboard-title-lg font-bold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-dashboard-text lg:text-dashboard-text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 lg:mt-20"
        >
          <h3 className="text-dashboard-title lg:text-dashboard-title-lg font-bold mb-6 text-foreground">
            Ready to start your merch empire?
          </h3>
          <Button size="lg" className="btn-primary px-8 py-4 text-base" asChild>
            <Link to="/signup">
              Get Started Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
