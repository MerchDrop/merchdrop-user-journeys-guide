
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
    <section className="py-20 bg-white text-black" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-black">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to turn your creativity into a revenue stream. 
            No upfront costs, no inventory management, no hassle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-black text-white rounded-lg">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-300">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold mb-6 text-black">
            Ready to start your merch empire?
          </h3>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg">
            <Link to="/signup" className="flex items-center">
              Get Started Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
