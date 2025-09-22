
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { Search, Menu, X, ShoppingCart, User, Settings, LogOut } from 'lucide-react';

const Header = ({ transparent = false }: { transparent?: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, profile, signOut, loading, isAdmin, isArtist } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className={`absolute top-8 z-40 w-full ${transparent ? 'bg-transparent border-transparent' : 'sticky top-0 border-b border-gray-200 bg-white'}`}>
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 my-4 ${transparent ? 'bg-transparent text-white' : ''}`}>
        <div className="flex h-16 items-center justify-between">
          {/* Left Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/creators" className={`text-[14px] transition-colors ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>
              For Creators
            </Link>
            <Link to="/shop" className={`text-[14px] transition-colors ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>
              Shop
            </Link>
          </div>

          {/* Centered Logo */}
          <Link to="/" className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            <img 
              src="/Merchdrop.png" 
              alt="MerchDrop" 
              className={`h-12 w-auto ${transparent ? 'brightness-200 mix-blend-screen' : ''}`}
            />
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${transparent ? 'text-white' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    transparent 
                      ? 'border-white/20 bg-white/10 text-white placeholder-white/70 focus:bg-white/20' 
                      : 'border-gray-200 bg-white focus:ring-black'
                  }`}
                />
              </div>
            </div>

            <Link to="/cart" className={`relative p-2 transition-colors ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[11px] rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <CurrencySelector className={transparent ? 'text-white border-white/20' : ''} />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`relative ${transparent ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100'}`}>
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className={`${transparent ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900'} font-medium`}>
                        {getInitials(profile?.display_name || profile?.first_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="px-2 py-1.5">
                    <p className="text-[14px] font-medium">{profile?.display_name || profile?.first_name || 'User'}</p>
                    <p className="text-[12px] text-muted-foreground">{profile?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isArtist && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/products" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Products
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className={`text-[14px] ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`} asChild>
                  <Link to="/user-auth">Shop</Link>
                </Button>
                <Button variant="default" size="sm" className={`text-[14px] ${transparent ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`} asChild>
                  <Link to="/creators">Start Creating</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in-up">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search artists, products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <Link 
                to="/creators" 
                className={`text-[14px] transition-colors py-2 ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                For Creators
              </Link>
              <Link 
                to="/shop" 
                className={`text-[14px] transition-colors py-2 ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
            <Link 
              to="/cart" 
              className={`text-[14px] flex items-center transition-colors py-2 ${transparent ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({getTotalItems()})
            </Link>
              
              <div className="py-2">
                <CurrencySelector className="w-full" />
              </div>
              
{user ? (
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <Avatar className="h-8 w-8 border-2 border-gray-300">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-gray-100 text-gray-900 font-medium">
                      {getInitials(profile?.display_name || profile?.first_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium">{profile?.display_name || profile?.first_name || 'User'}</p>
                    <p className="text-[12px] text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="ghost" className="text-[14px] text-black hover:text-gray-600" asChild>
                    <Link to="/user-auth" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                  </Button>
                  <Button variant="default" className="text-[14px] bg-black text-white hover:bg-gray-800" asChild>
                    <Link to="/creators" onClick={() => setIsMenuOpen(false)}>Start Creating</Link>
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
