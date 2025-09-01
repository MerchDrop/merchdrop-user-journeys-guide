import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Bell,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Live animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
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

  return <span>{count}</span>;
};

// Interactive KPI Card with animations
const InteractiveKpiCard = ({ title, value, change, trend, icon: Icon, index, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground'
  }[trend];

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        type: "spring",
        bounce: 0.4
      }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => {
        setIsClicked(true);
        onClick?.(title);
        setTimeout(() => setIsClicked(false), 200);
      }}
      className="cursor-pointer"
    >
      <Card className={`relative overflow-hidden border transition-all duration-300 ${
        isHovered ? 'shadow-lg border-primary/30 bg-gradient-to-br from-background to-muted/20' : 'shadow-sm'
      }`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '0%' : '-100%' }}
          transition={{ duration: 0.5 }}
        />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <motion.div
            animate={{ 
              rotate: isHovered ? 360 : 0,
              scale: isClicked ? 1.2 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className={`h-5 w-5 transition-colors duration-300 ${
              isHovered ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </motion.div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <motion.div 
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </motion.div>
          
          <motion.div 
            className={`flex items-center gap-1 text-sm ${trendColor}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{change}</span>
            <span className="text-muted-foreground ml-1">vs last week</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Live Chart Component
const LiveChart = ({ data, title }: { data: any[]; title: string }) => {
  const [animatedData, setAnimatedData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {animatedData.map((item, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-t from-primary to-primary/60 rounded-t-md flex-1 min-w-8 relative group"
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / Math.max(...animatedData.map(d => d.value))) * 100}%` }}
                transition={{ 
                  duration: 1.5, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.3
                }}
                whileHover={{ 
                  scale: 1.05,
                  filter: "brightness(1.2)",
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ y: 10 }}
                  whileHover={{ y: 0 }}
                >
                  {item.value}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Notification Component
const LiveNotification = ({ notification, onClose }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    className="fixed top-20 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-sm"
  >
    <div className="flex items-start gap-3">
      <div className="bg-primary/10 p-2 rounded-full">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={onClose}>
        ×
      </Button>
    </div>
  </motion.div>
);

export default function LiveDashboard() {
  const { formatPrice } = useCurrency();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState([
    { title: 'Revenue', value: 0, change: '+12.5%', trend: 'up', icon: DollarSign },
    { title: 'Orders', value: 0, change: '+8.2%', trend: 'up', icon: ShoppingCart },
    { title: 'Products', value: 0, change: '+3.1%', trend: 'up', icon: Package },
    { title: 'Customers', value: 0, change: '+15.7%', trend: 'up', icon: Users },
  ]);

  const [chartData] = useState([
    { label: 'Mon', value: 150 },
    { label: 'Tue', value: 230 },
    { label: 'Wed', value: 180 },
    { label: 'Thu', value: 290 },
    { label: 'Fri', value: 320 },
    { label: 'Sat', value: 280 },
    { label: 'Sun', value: 190 },
  ]);

  const [recentActivity] = useState([
    { id: 1, type: 'order', message: 'New order from John Doe', time: '2 min ago', value: 89.99 },
    { id: 2, type: 'product', message: 'T-shirt design updated', time: '5 min ago', value: null },
    { id: 3, type: 'review', message: 'New 5-star review received', time: '10 min ago', value: null },
    { id: 4, type: 'payout', message: 'Payout processed', time: '1 hour ago', value: 450.00 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate KPI updates
      setKpiData(prev => prev.map(kpi => ({
        ...kpi,
        value: kpi.value + Math.floor(Math.random() * 10)
      })));

      // Add random notifications
      if (Math.random() > 0.95) {
        const notifications = [
          { title: 'New Order!', message: 'Someone just bought your artwork' },
          { title: 'Sale Alert', message: 'Your product is trending' },
          { title: 'Review Added', message: 'New customer review received' },
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        setNotifications(prev => [...prev, { ...randomNotification, id: Date.now() }]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-remove notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleKpiClick = useCallback((title: string) => {
    toast.success(`Viewing details for ${title}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <LiveNotification
            key={notification.id}
            notification={notification}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </AnimatePresence>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Live Dashboard
            </h1>
            <motion.p 
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Real-time insights • Last updated: {currentTime.toLocaleTimeString()}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Live Mode
            </Button>
          </motion.div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <InteractiveKpiCard
              key={kpi.title}
              {...kpi}
              index={index}
              onClick={handleKpiClick}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveChart data={chartData} title="Sales Analytics" />
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Conversion Rate', value: 3.2, max: 5, color: 'bg-green-500' },
                  { label: 'Avg Order Value', value: 4.1, max: 5, color: 'bg-blue-500' },
                  { label: 'Customer Satisfaction', value: 4.7, max: 5, color: 'bg-purple-500' },
                  { label: 'Return Rate', value: 1.2, max: 5, color: 'bg-orange-500' },
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{metric.label}</span>
                      <span className="font-medium">{metric.value}/5</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${metric.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div>
                          <p className="font-medium text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      {activity.value && (
                        <Badge variant="secondary" className="font-mono">
                          {formatPrice(activity.value)}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}