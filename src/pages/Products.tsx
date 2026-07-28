import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, ShoppingCart, Star, Flame, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeImageUrl } from '@/lib/image-utils';
import { getProductUrl } from '@/lib/slug-utils';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

type UiProduct = {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  likes?: number;
  sales?: number;
  trending?: boolean;
  onSale?: boolean;
  category?: string;
  tags?: string[];
  publishedAt?: string | null;
};

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" }
];

export default function Products() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (data) {
      setCategories(['All', ...data.map(cat => cat.name)]);
    }
  };

  const loadProducts = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, 
        slug, 
        title, 
        description, 
        price_cents, 
        currency, 
        stock, 
        main_image_url, 
        published_at, 
        status,
        tags,
        artist_id,
        category:categories(name),
        artist_profiles(artist_name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!error && data) {
      // Query reviews, order_items, and wishlists tables to compute real metrics
      const { data: reviewsData } = await supabase.from('reviews').select('product_id, rating');
      const { data: orderItemsData } = await supabase.from('order_items').select('product_id, quantity');
      const { data: wishlistsData } = await supabase.from('wishlists').select('product_id');

      const reviewMap: { [id: string]: { count: number; sum: number } } = {};
      reviewsData?.forEach((r) => {
        if (!reviewMap[r.product_id]) reviewMap[r.product_id] = { count: 0, sum: 0 };
        reviewMap[r.product_id].count += 1;
        reviewMap[r.product_id].sum += Number(r.rating || 0);
      });

      const salesMap: { [id: string]: number } = {};
      orderItemsData?.forEach((item) => {
        salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1);
      });

      const likesMap: { [id: string]: number } = {};
      wishlistsData?.forEach((w) => {
        likesMap[w.product_id] = (likesMap[w.product_id] || 0) + 1;
      });

      const mapped: UiProduct[] = data.map((p: any) => {
        const rStats = reviewMap[p.id] || { count: 0, sum: 0 };
        const avgRating = rStats.count > 0 ? rStats.sum / rStats.count : 0;
        const totalSales = salesMap[p.id] || 0;
        const totalLikes = likesMap[p.id] || 0;

        return {
          id: p.id,
          slug: p.slug,
          name: p.title,
          artist: p.artist_profiles?.artist_name,
          artistId: p.artist_id,
          price: (p.price_cents ?? 0) / 100,
          image: sanitizeImageUrl(p.main_image_url),
          rating: avgRating,
          reviews: rStats.count,
          likes: totalLikes,
          sales: totalSales,
          trending: totalSales >= 5,
          onSale: false,
          category: p.category?.name,
          tags: p.tags || [],
          publishedAt: p.published_at ?? null,
        };
      });
      setProducts(mapped);
    } else {
      console.error('Error loading products', error);
      setProducts([]);
    }
    setLoadingData(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'newest':
        return new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();
      default:
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">
              All <span className="text-primary font-bold">Products</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover unique artwork from talented artists around the world
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort and Filter */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid */}
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border border-gray-200">
                  <div className="w-full h-48 bg-muted animate-pulse rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.trending && (
                        <Badge className="bg-red-500 text-white">
                          <Flame className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {product.onSale && (
                        <Badge className="bg-green-500 text-white">
                          <Tag className="w-3 h-3 mr-1" />
                          Sale
                        </Badge>
                      )}
                    </div>

                    {/* Like Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    {/* Artist */}
                    {product.artist && (
                      <Link 
                        to={`/artist/${product.artist.toLowerCase().replace(' ', '-')}`}
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        {product.artist}
                      </Link>
                    )}

                    {/* Product Name */}
                    <Link to={getProductUrl(product)}>
                      <h3 className="font-semibold text-black hover:text-gray-600 transition-colors mt-1 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.reviews > 0 ? (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                        <span>No reviews yet</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-black">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {product.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {product.sales}
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="bg-black text-white hover:bg-gray-800"
                        onClick={() => {
                          addItem({
                            id: product.id,
                            name: product.name,
                            artist: product.artist,
                            artistId: product.artistId,
                            price: product.price,
                            image: product.image
                          }, 1);
                          
                          toast({
                            title: "Added to cart!",
                            description: `${product.name} has been added to your cart.`,
                          });
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filters'
                  : 'No products have been published yet'
                }
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}