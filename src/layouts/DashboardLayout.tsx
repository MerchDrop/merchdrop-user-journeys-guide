import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Package,
  CreditCard,
  Settings,
  Home,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CurrencySelector } from '@/components/ui/currency-selector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { supabase } from '@/integrations/supabase/client';

const sidebarItemsConfig = [
  { name: 'Overview', href: '/dashboard', icon: Home, allowPending: true },
  { name: 'My Products', href: '/dashboard/products', icon: Package, allowPending: false },
  { name: 'Browse Designs', href: '/dashboard/designs', icon: Package, allowPending: false },
  { name: 'Orders', href: '/dashboard/orders', icon: BarChart3, allowPending: false },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, allowPending: false },
  { name: 'Payouts', href: '/dashboard/payouts', icon: CreditCard, allowPending: false },
  { name: 'Profile', href: '/dashboard/profile', icon: User, allowPending: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, allowPending: true },
];


export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isArtist, isAdmin, loading, profile } = useAuth();

  // Redirect non-authenticated users or non-artists (allow admins too)
  useEffect(() => {
    console.log('DashboardLayout: user:', user, 'loading:', loading, 'isArtist:', isArtist, 'isAdmin:', isAdmin);
    
    if (!loading) {
      const canAccess = !!user && (isArtist || isAdmin);
      if (!user) {
        console.log('DashboardLayout: No user, redirecting to artist-auth');
        navigate('/artist-auth', { replace: true });
      } else if (!canAccess) {
        console.log('DashboardLayout: User lacks access, redirecting to artist-auth');
        navigate('/artist-auth', { replace: true });
      }
    }
  }, [user, isArtist, isAdmin, loading, navigate]);

  // Check artist status for pending approval
  useEffect(() => {
    const checkArtistStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('artist_profiles')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsPending(data?.status === 'pending');
    };
    
    checkArtistStatus();
  }, [user]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated or lacks access
  if (!user || !(isArtist || isAdmin)) {
    return null;
  }

  const renderNavLink = (item: typeof sidebarItemsConfig[0], isMobile = false) => {
    const isActive = location.pathname === item.href;
    const isDisabled = isPending && !item.allowPending;

    return (
      <NavLink
        key={item.name}
        to={isDisabled ? '#' : item.href}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
          } else if (isMobile) {
            setSidebarOpen(false);
          }
        }}
        className={({ isActive: navIsActive }) =>
          `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDisabled
              ? 'opacity-50 cursor-not-allowed text-muted-foreground'
              : isActive || navIsActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-card lg:border-r lg:border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col h-16 px-6 border-b border-border">
            <Link to="/" className="flex items-center py-4">
              <img 
                src="/lovable-uploads/f708172b-4051-49f4-9f48-2681025d79d3.png" 
                alt="MerchDrop" 
                className="h-6 w-auto"
              />
            </Link>
            <Link 
              to="/" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors pb-2"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItemsConfig.map((item) => renderNavLink(item))}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.display_name || profile?.first_name || 'Artist'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Artist
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col h-16 px-6 border-b border-border">
            <div className="flex items-center justify-between py-4">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/f708172b-4051-49f4-9f48-2681025d79d3.png" 
                  alt="MerchDrop" 
                  className="h-6 w-auto"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Link 
              to="/" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors pb-2"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItemsConfig.map((item) => renderNavLink(item, true))}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.display_name || profile?.first_name || 'Artist'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Artist
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <CurrencySelector />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}
                >
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}