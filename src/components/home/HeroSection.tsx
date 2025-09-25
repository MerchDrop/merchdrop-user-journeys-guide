import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, TrendingUp, Users, Sparkles, DollarSign, Package, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from './SearchBar';
import HeroBackground from './HeroBackground';
import { useCurrency } from '@/context/CurrencyContext';
// Live animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2000 }: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  duration?: number; 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Interactive dashboard card component
const DashboardCard = ({ title, value, prefix, suffix, icon: Icon, color, delay, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.3 }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`relative overflow-hidden border transition-all duration-300 ${
        isHovered ? 'shadow-lg border-primary/30 bg-gradient-to-br from-background to-muted/20' : 'shadow-sm'
      }`}>
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5`}
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '0%' : '-100%' }}
          transition={{ duration: 0.5 }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              animate={{ 
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon className={`h-8 w-8 transition-colors duration-300 ${
                isHovered ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </motion.div>
            
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <motion.div 
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            <AnimatedCounter 
              value={currentValue} 
              prefix={prefix} 
              suffix={suffix}
              duration={1500}
            />
          </motion.div>
          
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.4 }}
          >
            {title}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HeroSection = () => {
  const { formatPrice } = useCurrency();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const dashboardData = [
    {
      title: 'Total Revenue',
      value: 125420,
      prefix: '₦',
      suffix: '',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      delay: 0
    },
    {
      title: 'Active Orders',
      value: 1342,
      prefix: '',
      suffix: '',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      title: 'Live Viewers',
      value: 847,
      prefix: '',
      suffix: '',
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      delay: 0.2
    },
    {
      title: 'Products Sold',
      value: 2156,
      prefix: '',
      suffix: '',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      delay: 0.3
    }
  ];

  const handleCardClick = (title: string) => {
    // Navigate to live dashboard or show more details
    window.location.href = '/live-dashboard';
  };
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
              Your Merch, Your Brand, 
              <br />
              <span className="text-accent">Your Revenue.</span>
            </h1>
            
            <p className="text-[16px] lg:text-[18px] text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create your online dashboard that sells custom swag, from t-shirts, to belts ,  Quality on-demand products, global shipping, and instant payouts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="btn-primary text-base px-8 py-4" asChild>
              <Link to="/artist-auth">
                Start a drop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
              <span>&#8358;2M+ revenue generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.9/5 creator satisfaction</span>
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">Live Performance Dashboard</h2>
            </div>
            <p className="text-muted-foreground">
              Real-time insights • Updated {currentTime.toLocaleTimeString()}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.map((item, index) => (
              <DashboardCard
                key={item.title}
                {...item}
                onClick={() => handleCardClick(item.title)}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/live-dashboard'}
                className="group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  View Full Dashboard
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;