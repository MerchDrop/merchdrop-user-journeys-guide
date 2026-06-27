import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroBackground from './HeroBackground';

const chartBars = [38, 62, 48, 75, 88, 67, 52];

const kpiCards = [
  { label: 'Revenue', value: '₦125K', change: '+12%', color: 'text-green-500' },
  { label: 'Orders', value: '1,342', change: '+8%', color: 'text-green-500' },
  { label: 'Viewers', value: '847', change: '+24%', color: 'text-green-500' },
  { label: 'Products', value: '28', change: '+3%', color: 'text-green-500' },
];

const navItems = ['Dashboard', 'Products', 'Orders', 'Analytics', 'Payouts', 'Settings'];

const activityItems = [
  'New order from Adewale M.',
  'T-shirt design approved',
  'Payout of ₦45K processed',
  '5-star review received',
];

const floatingBadges = [
  { label: 'Artist', dot: 'bg-gray-500', pos: '-left-14 top-20' },
  { label: 'Designer', dot: 'bg-blue-500', pos: '-right-14 top-32' },
  { label: 'Creator', dot: 'bg-green-500', pos: '-left-14 bottom-32' },
  { label: 'Brand', dot: 'bg-orange-500', pos: '-right-14 bottom-20' },
];

const DashboardMockup = () => (
  <div className="flex h-full bg-gray-50 text-left select-none">
    {/* Sidebar */}
    <div className="w-40 bg-white border-r border-gray-100 flex-shrink-0 p-3">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
        <img src="/Merchdrop.png" alt="" className="h-5 w-auto invert" />
      </div>
      <div className="space-y-0.5">
        {navItems.map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium ${
              i === 0 ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-sm ${i === 0 ? 'bg-white/40' : 'bg-gray-300'}`} />
            {item}
          </div>
        ))}
      </div>
    </div>

    {/* Main content */}
    <div className="flex-1 p-4 overflow-hidden min-w-0">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold text-gray-800">Good morning ☀️</p>
          <p className="text-[9px] text-gray-400">Here's your store at a glance</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] text-gray-400">Live</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {kpiCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
            <p className="text-[9px] text-gray-400 mb-0.5">{stat.label}</p>
            <p className="text-[12px] font-bold text-gray-800">{stat.value}</p>
            <p className={`text-[9px] font-medium ${stat.color}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-2 gap-2">
        {/* Bar chart */}
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-600 mb-2">Sales This Week</p>
          <div className="flex items-end gap-1 h-16">
            {chartBars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-gray-600 to-gray-400"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.08, ease: 'easeOut' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="flex-1 text-center text-[8px] text-gray-300">{d}</span>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-600 mb-2">Recent Activity</p>
          <div className="space-y-2">
            {activityItems.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-gray-500 leading-tight truncate">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-20 lg:py-28">
      <HeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline block */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Exclusive limited drops from your favorite artists
          </Badge>

          <h1 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
            Support the culture,
            <br />
            <span className="text-accent">wear the creativity.</span>
          </h1>

          <p className="text-[16px] lg:text-[18px] text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Shop exclusive limited drops from your favorite artists and step into their world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button size="lg" className="btn-primary text-base px-8 py-4" asChild>
              <Link to="/products">
                Shop Drops
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 py-4" asChild>
              <Link to="/products">
                <Play className="mr-2 h-5 w-5" />
                Browse Artists
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>10k+ fans already shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>&#8358;2M+ in drops sold</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.9/5 buyer satisfaction</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview — cascaded browser frame */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Ambient glow behind the frame */}
          <div className="absolute -inset-6 bg-gradient-to-r from-gray-400/15 via-gray-300/10 to-gray-400/15 blur-3xl -z-10 rounded-3xl" />

          {/* Floating role badges */}
          {floatingBadges.map(({ label, dot, pos }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className={`absolute ${pos} z-20 hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-lg`}
            >
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </motion.div>
          ))}

          {/* Browser chrome + dashboard */}
          <div
            className="rounded-xl overflow-hidden border border-gray-200/80 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25)]"
            style={{
              transform: 'perspective(1400px) rotateX(6deg)',
              transformOrigin: 'center top',
            }}
          >
            {/* Browser title bar */}
            <div className="bg-[#f0f0f0] border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded border border-gray-200 px-4 py-1 text-[11px] text-gray-400 w-56 text-center">
                  app.merchdrop.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="h-[360px] bg-gray-50 overflow-hidden">
              <DashboardMockup />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;