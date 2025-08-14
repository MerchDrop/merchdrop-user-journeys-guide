import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wand2, Megaphone, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const KeyValueProps = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const features = [
    {
      icon: Wand2,
      label: "Create",
      title: "Design without the headache",
      description: "Upload art or use ready-made templates. Auto-mockups, variants, and size guides included."
    },
    {
      icon: Megaphone,
      label: "Drop",
      title: "Share and sell instantly",
      description: "One link for your drop. Built-in checkout, discount codes, and order tracking."
    },
    {
      icon: Truck,
      label: "Fulfill",
      title: "We handle the rest",
      description: "Production, payments, and shipping are automated. Real-time updates for you and your fans."
    }
  ];

  return (
    <section id="features" className="relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="rounded-lg border p-5 hover:shadow-sm transition-all hover:-translate-y-0.5 border-border bg-card">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <feature.icon className="w-4 h-4" strokeWidth={1.5} />
                  {feature.label}
                </div>
                <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 text-[14px] text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyValueProps;