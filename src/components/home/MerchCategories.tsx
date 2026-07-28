import React from 'react';
import { Link } from 'react-router-dom';
import { getProductUrl } from '@/lib/slug-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProductsQuery';
import { useCurrency } from '@/context/CurrencyContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const MerchCategories = () => {
  const { products, loading } = useProducts();
  const { formatPrice } = useCurrency();

  // Group products by category
  const categories = [
    { name: 'T-Shirts', filter: 't-shirt' },
    { name: 'Hoodies', filter: 'hoodie' },
    { name: 'Accessories', filter: 'accessory' },
    { name: 'Prints', filter: 'print' }
  ];

  const getProductsByCategory = (filter: string) => {
    return products?.filter(product => 
      product.title?.toLowerCase().includes(filter) || 
      product.description?.toLowerCase().includes(filter) ||
      product.category?.name?.toLowerCase().includes(filter) ||
      product.category?.slug?.toLowerCase().includes(filter)
    ).slice(0, 4) || [];
  };

  const getBadge = (product: any) => {
    const publishedDate = new Date(product.published_at || product.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff <= 7) return { text: 'New', variant: 'default' };
    if (product.stock && product.stock <= 10) return { text: 'Limited', variant: 'destructive' };
    return { text: 'Best seller', variant: 'secondary' };
  };

  if (loading) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Shop Merchandise</h2>
            <p className="text-lg text-muted-foreground">Discover unique merchandise from talented creators</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate matching items per category
  const categorizedProducts = categories.map(cat => ({
    ...cat,
    items: getProductsByCategory(cat.filter)
  })).filter(c => c.items.length > 0);

  // If no category filter matched, display all available products in a "Featured Merchandise" section
  const displaySections = categorizedProducts.length > 0
    ? categorizedProducts
    : (products && products.length > 0 ? [{ name: 'Featured Merchandise', filter: '', items: products }] : []);

  if (displaySections.length === 0) {
    return null;
  }

  return (
    <div className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Shop Merchandise</h2>
          <p className="text-lg text-muted-foreground">Discover unique merchandise from talented creators</p>
        </div>
        
        {displaySections.map((category) => (
          <div key={category.name} className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-foreground">{category.name}</h3>
              <Button variant="outline" asChild>
                <Link to={category.filter ? `/products?category=${category.filter}` : '/products'}>View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((product: any) => {
                const badge = getBadge(product);
                const productImage = product.product_images?.[0]?.url || product.main_image_url || '/placeholder.svg';
                
                return (
                  <Card key={product.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge 
                        variant={badge.variant as any}
                        className="absolute top-3 left-3 text-xs"
                      >
                        {badge.text}
                      </Badge>
                      
                      {/* Quick actions on hover */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm">
                          <Heart className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm">
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src="/placeholder.svg"
                            alt={product.artist_profiles?.artist_name || 'Artist'}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <Link 
                            to={`/artist/${product.artist_profiles?.artist_slug || product.artist_id}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {product.artist_profiles?.artist_name || 'Unknown Artist'}
                          </Link>
                        </div>
                        
                        <Link 
                          to={getProductUrl(product)}
                          className="block"
                        >
                          <h3 className="font-medium text-foreground hover:text-accent transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-foreground">
                              {formatPrice(product.price_cents / 100)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MerchCategories;