import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Showcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const showcaseItems = [
    {
      icon: LayoutDashboard,
      label: "Creator dashboard",
      title: "Everything you need to run drops",
      description: "Create products, set pricing, launch discount codes, and watch orders update in real time.",
      image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1600&auto=format&fit=crop",
      alt: "dashboard"
    },
    {
      icon: ShoppingBag,
      label: "Fan checkout",
      title: "Frictionless checkout that converts",
      description: "Optimized for mobile. One-page checkout, live shipping rates, and instant confirmations.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop",
      alt: "checkout"
    }
  ];

  return (
    <section className="relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="rounded-xl border overflow-hidden hover:shadow-sm transition-all border-border bg-card h-full">
                <div className="p-5">
                  <div className="inline-flex items-center gap-2 text-meta font-medium text-muted-foreground">
                    <item.icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </div>
                  <h3 className="mt-2 text-h3 font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-dashboard-text text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="aspect-[16/10]">
                  <img 
                    src={item.image} 
                    alt={item.alt} 
                    className="w-full h-full object-cover border-t border-border"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;