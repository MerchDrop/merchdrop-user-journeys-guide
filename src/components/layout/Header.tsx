import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, Bell, Zap, Sparkles, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CurrencySelector } from '@/components/ui/currency-selector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-black/5 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Section - Modern with Badge */}
          <Link to="/" className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105">
            <div className="relative">
              <img 
                src="/lovable-uploads/f708172b-4051-49f4-9f48-2681025d79d3.png" 
                alt="MerchDrop" 
                className="h-10 w-auto transition-all duration-300 group-hover:brightness-110"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-accent to-accent-light rounded-full animate-pulse opacity-80"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                MerchDrop
              </span>
              <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5 bg-accent/10 text-accent font-medium">
                Beta
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/artists" 
              className="group relative text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300"
            >
              Explore Artists
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/products" 
              className="group relative text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300"
            >
              Browse Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/how-it-works" 
              className="group relative text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Enhanced Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}>
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${isSearchFocused ? 'text-accent' : 'text-muted-foreground'}`} />
              <input
                type="text"
                placeholder="Search products, artists..."
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm placeholder-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 hover:bg-muted/70"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs bg-background border border-border rounded text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            {/* Cart */}
            <Link to="/cart" className="group relative p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-300 hover:scale-105">
              <ShoppingCart className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors duration-300" />
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-accent text-accent-foreground animate-bounce">
                  {items.length}
                </Badge>
              )}
            </Link>

            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-300 hover:scale-105">
                  <Bell className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors duration-300" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-accent/20 hover:ring-accent/40 transition-all duration-300">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-accent to-accent-light text-white text-sm font-semibold">
                          {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-lg mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-accent to-accent-light text-white">
                          {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenuItem asChild className="group cursor-pointer">
                      <Link to="/dashboard" className="flex items-center">
                        <Zap className="mr-3 h-4 w-4 text-accent group-hover:text-accent-light transition-colors" />
                        <span>Dashboard</span>
                        <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </DropdownMenuItem>
                    
                    {user.user_metadata?.role === 'artist' && (
                      <DropdownMenuItem asChild className="group cursor-pointer">
                        <Link to="/merch-creator" className="flex items-center">
                          <Sparkles className="mr-3 h-4 w-4 text-accent group-hover:text-accent-light transition-colors" />
                          <span>Manage Products</span>
                          <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user.user_metadata?.role === 'admin' && (
                      <DropdownMenuItem asChild className="group cursor-pointer">
                        <Link to="/admin" className="flex items-center">
                          <User className="mr-3 h-4 w-4 text-accent group-hover:text-accent-light transition-colors" />
                          <span>Admin Panel</span>
                          <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Link to="/signup" className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Creating
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-xl">
            <div className="p-6 space-y-6">
              
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4">
                <Link 
                  to="/artists" 
                  className="block text-foreground hover:text-accent transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore Artists
                </Link>
                <Link 
                  to="/products" 
                  className="block text-foreground hover:text-accent transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Products
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="block text-foreground hover:text-accent transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
              </nav>

              {/* Mobile Currency & Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <CurrencySelector />
                <Link 
                  to="/cart" 
                  className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart ({items.length})</span>
                </Link>
              </div>

              {/* Mobile Auth */}
              {!user && (
                <div className="flex space-x-3 pt-4 border-t border-border/50">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1 bg-gradient-to-r from-accent to-accent-light text-white">
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Start Creating</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
export default Header;