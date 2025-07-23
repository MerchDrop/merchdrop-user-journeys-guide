
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-black">
              MerchDrop
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search artists, products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/artists" className="text-black hover:text-gray-600 transition-colors">
              Browse Artists
            </Link>
            <Link to="/products" className="text-black hover:text-gray-600 transition-colors">
              Products
            </Link>
            <Link to="/cart" className="relative p-2 text-black hover:text-gray-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-black hover:text-gray-600" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-black text-white hover:bg-gray-800" asChild>
                <Link to="/signup">Start Creating</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
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
                to="/artists" 
                className="text-black hover:text-gray-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Artists
              </Link>
              <Link 
                to="/products" 
                className="text-black hover:text-gray-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/cart" 
                className="flex items-center text-black hover:text-gray-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart (0)
              </Link>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button variant="ghost" className="text-black hover:text-gray-600" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </Button>
                <Button variant="default" className="bg-black text-white hover:bg-gray-800" asChild>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Start Creating</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
