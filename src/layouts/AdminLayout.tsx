import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';
import DashboardFooter from '@/components/layout/DashboardFooter';
import {
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart,
  Settings,
  BarChart3,
  UserCheck,
  Palette,
  Truck,
  Wallet,
  Boxes,
  Tag,
  MessageSquare,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Designs',
    href: '/admin/designs',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Shipping',
    href: '/admin/shipping',
    icon: Truck,
  },
  {
    title: 'Payouts',
    href: '/admin/payouts',
    icon: Wallet,
  },
  {
    title: 'Promotions',
    href: '/admin/promotions',
    icon: Tag,
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes,
  },
  {
    title: 'Support',
    href: '/admin/support',
    icon: MessageSquare,
  },
  {
    title: 'CMS',
    href: '/admin/cms',
    icon: FileText,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ShieldCheck,
  },
  {
    title: 'Artists',
    href: '/admin/artists',
    icon: Users,
  },
  {
    title: 'Designers',
    href: '/admin/designers',
    icon: Palette,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: UserCheck,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout() {
  const { user, isAdmin, isSuperAdmin, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Restrict access to admin and super admin only
  if (!user || (!isAdmin && !isSuperAdmin)) {
    return <Navigate to="/admin-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 min-h-[calc(100vh-80px)] bg-card border-r border-border">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
            </div>
            <Link 
              to="/" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}