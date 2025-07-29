import React, { useState } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from 'framer-motion';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const trendingSearches = [
    'Luna Rivers', 'Vintage tees', 'Hoodies', 'Limited drops', 'Indie artists'
  ];

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Handle search logic
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-card rounded-full shadow-card hover:shadow-hero transition-shadow duration-300 overflow-hidden">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists, merch, or styles..."
              className="pl-12 pr-4 py-4 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
            />
          </div>
          
          <div className="flex items-center pr-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="mr-2">
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold">Filter by</h4>
                  
                  {/* Product Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Product Type</label>
                    <div className="flex flex-wrap gap-2">
                      {['T-Shirts', 'Hoodies', 'Caps', 'Accessories'].map((type) => (
                        <Badge key={type} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="flex flex-wrap gap-2">
                      {['Under $25', '$25-$50', '$50-$75', '$75+'].map((range) => (
                        <Badge key={range} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {range}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Genre/Style */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Style</label>
                    <div className="flex flex-wrap gap-2">
                      {['Vintage', 'Minimalist', 'Bold', 'Artistic'].map((style) => (
                        <Badge key={style} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(false)}>
                      Clear All
                    </Button>
                    <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={() => handleSearch(searchQuery)}
              variant="hero" 
              size="lg"
              className="rounded-full px-8"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Trending Searches */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex items-center justify-center gap-3 flex-wrap"
      >
        <div className="flex items-center text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 mr-1" />
          Trending:
        </div>
        {trendingSearches.map((term, index) => (
          <motion.button
            key={term}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => handleTrendingClick(term)}
            className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            {term}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default SearchBar;