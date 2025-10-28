import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Upload, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  User,
  Menu,
  Bell
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardFooter from '@/components/layout/DashboardFooter';

const DesignerLayout = () => {
  const { user, loading, isDesigner, isAdmin, isSuperAdmin, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, setIsPending] = React.useState(false);
  const [designerStatus, setDesignerStatus] = React.useState<string | null>(null);
  const [statusLoading, setStatusLoading] = React.useState(true);
  
  // Check designer status and set pending flag
  useEffect(() => {
    const checkDesignerStatus = async () => {
      if (!user) {
        setStatusLoading(false);
        return;
      }
      
      setStatusLoading(true);
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('designer_profiles')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setDesignerStatus(data?.status || null);
      setIsPending(data?.status === 'pending');
      setStatusLoading(false);
    };
    
    checkDesignerStatus();
  }, [user]);

  // Allow access if user has active designer role, active OR pending designer profile
  const canAccess = isDesigner || isAdmin || isSuperAdmin || designerStatus === 'active' || designerStatus === 'pending';

  useEffect(() => {
    if (!loading && !statusLoading && (!user || !canAccess)) {
      console.log('DesignerLayout: Access denied. User:', user?.email, 'isDesigner:', isDesigner, 'isAdmin:', isAdmin, 'isSuperAdmin:', isSuperAdmin, 'designerStatus:', designerStatus);
      navigate('/designer-auth');
    }
  }, [user, loading, statusLoading, canAccess, navigate, isDesigner, isAdmin, isSuperAdmin, designerStatus]);

  if (loading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !canAccess) {
    return null;
  }

  const sidebarItems = [
    { name: 'Dashboard', href: '/designer/dashboard', icon: LayoutDashboard, allowPending: true },
    { name: 'Upload Design', href: '/designer/upload', icon: Upload, allowPending: false },
    { name: 'My Designs', href: '/designer/designs', icon: FolderOpen, allowPending: false },
    { name: 'All Artists', href: '/designer/artists', icon: Users, allowPending: false },
    { name: 'Analytics', href: '/designer/analytics', icon: TrendingUp, allowPending: false },
    { name: 'Payouts', href: '/designer/payouts', icon: CreditCard, allowPending: false },
    { name: 'Profile', href: '/designer/profile', icon: User, allowPending: true },
    { name: 'Settings', href: '/designer/settings', icon: Settings, allowPending: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/designer-auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">Designer Portal</h2>
        <p className="text-sm text-muted-foreground">MergeDrop</p>
        <Link 
          to="/" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 inline-block"
        >
          ← Back to Home
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const isDisabled = isPending && !item.allowPending;
          return (
            <Link
              key={item.name}
              to={isDisabled ? '#' : item.href}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                }
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                  : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.name}
              {item.name === 'My Designs' && !isDisabled && (
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Designer</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold">Designer Portal</h1>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center gap-4 border-b bg-card px-6">
          <h1 className="font-semibold text-lg">Designer Portal</h1>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || profile?.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
};

export default DesignerLayout;