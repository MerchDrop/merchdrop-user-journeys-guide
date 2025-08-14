import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Artist {
  id: string;
  artist_name: string;
  artist_slug: string;
}

interface SearchFilters {
  query: string;
  categories: string[];
  artists: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onFiltersChange, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    artists: [],
    priceRange: [0, 500],
    rating: 0,
    inStock: false,
    featured: false,
    tags: [],
    ...initialFilters,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    artists: false,
    price: true,
    rating: false,
    other: false,
  });

  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const loadFilterData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      // Load artists
      const { data: artistsData } = await supabase
        .from('artist_profiles')
        .select('id, artist_name, artist_slug')
        .eq('status', 'approved')
        .order('artist_name');

      // Load popular tags
      const { data: tagsData } = await supabase
        .from('products')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null);

      // Extract and count tags
      const tagCounts: Record<string, number> = {};
      tagsData?.forEach(product => {
        product.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag]) => tag);

      setCategories(categoriesData || []);
      setArtists(artistsData || []);
      setPopularTags(sortedTags);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayFilter = (key: keyof Pick<SearchFilters, 'categories' | 'artists' | 'tags'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      artists: [],
      priceRange: [0, 500],
      rating: 0,
      inStock: false,
      featured: false,
      tags: [],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categories.length > 0) count++;
    if (filters.artists.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SearchInput = () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search products, artists, or keywords..."
        value={filters.query}
        onChange={(e) => updateFilters({ query: e.target.value })}
        className="pl-10"
      />
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible open={expandedSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium">Categories</Label>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => toggleArrayFilter('categories', category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm">
                {category.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range */}
      <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium">Price Range</Label>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            max={500}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Rating */}
      <Collapsible open={expandedSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium">Minimum Rating</Label>
          {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={() => updateFilters({ rating: filters.rating === rating ? 0 : rating })}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">& up</span>
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Artists */}
      <Collapsible open={expandedSections.artists} onOpenChange={() => toggleSection('artists')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium">Artists</Label>
          {expandedSections.artists ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2 max-h-40 overflow-y-auto">
          {artists.slice(0, 10).map(artist => (
            <div key={artist.id} className="flex items-center space-x-2">
              <Checkbox
                id={`artist-${artist.id}`}
                checked={filters.artists.includes(artist.id)}
                onCheckedChange={() => toggleArrayFilter('artists', artist.id)}
              />
              <Label htmlFor={`artist-${artist.id}`} className="text-sm">
                {artist.artist_name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Other Filters */}
      <Collapsible open={expandedSections.other} onOpenChange={() => toggleSection('other')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium">Other Filters</Label>
          {expandedSections.other ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
            />
            <Label htmlFor="in-stock" className="text-sm">In Stock Only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) => updateFilters({ featured: !!checked })}
            />
            <Label htmlFor="featured" className="text-sm">Featured Products</Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Popular Tags */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Popular Tags</Label>
        <div className="flex flex-wrap gap-2">
          {popularTags.slice(0, 12).map(tag => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayFilter('tags', tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
        disabled={getActiveFiltersCount() === 0}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Input - Always Visible */}
      <SearchInput />

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="start">
            <FilterContent />
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.query}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ query: '' })}
              />
            </Badge>
          )}
          
          {filters.categories.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.categories.length} Categories
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ categories: [] })}
              />
            </Badge>
          )}

          {filters.artists.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.artists.length} Artists
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ artists: [] })}
              />
            </Badge>
          )}

          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ priceRange: [0, 500] })}
              />
            </Badge>
          )}

          {filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.rating}+ Stars
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ rating: 0 })}
              />
            </Badge>
          )}

          {filters.tags.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.tags.length} Tags
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ tags: [] })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
