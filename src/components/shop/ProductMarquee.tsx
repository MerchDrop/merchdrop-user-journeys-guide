import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProductsQuery';
import { useCurrency } from '@/context/CurrencyContext';
import { Badge } from '@/components/ui/badge';
import { sanitizeImageUrl } from '@/lib/image-utils';

const ProductMarquee = () => {
  const { products, loading } = useProducts();
  const { formatPrice } = useCurrency();

  // Use useMemo instead of useEffect + useState to prevent infinite loops
  const duplicatedProducts = useMemo(() => {
    // Take first 8 products and duplicate them for smooth infinite scroll
    const productSlice = products.slice(0, 8);
    return [...productSlice, ...productSlice, ...productSlice];
  }, [products]);

  const getBadge = (product: any) => {
    const publishedDate = new Date(product.published_at || product.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff <= 7) return { text: 'New', variant: 'default' };
    if (product.stock && product.stock <= 10) return { text: 'Limited', variant: 'destructive' };
    return { text: 'Hot', variant: 'secondary' };
  };

  if (duplicatedProducts.length === 0) {
    return (
      <div className="w-full bg-muted/30 py-8">
        <div className="flex space-x-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/30 py-8 overflow-hidden">
      <div className="flex space-x-6 animate-marquee">
        {duplicatedProducts.map((product, index) => {
          const badge = getBadge(product);
          const productImage = sanitizeImageUrl(product.product_images?.[0]?.url || product.main_image_url);
          
          return (
            <Link
              key={`${product.id}-${index}`}
              to={`/product/${product.slug || product.id}`}
              className="flex-shrink-0 group"
            >
              <div className="flex items-center space-x-4 bg-background rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 w-80">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={productImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <Badge 
                    variant={badge.variant as any}
                    className="absolute -top-1 -right-1 text-xs scale-75"
                  >
                    {badge.text}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm mb-1 truncate group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    by {product.artist_profiles?.artist_name || 'Unknown Artist'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(product.price_cents / 100)}
                    </span>
                    {product.stock <= 0 ? (
                      <span className="text-xs text-red-500 font-semibold">Sold Out</span>
                    ) : product.stock <= 10 ? (
                      <span className="text-xs text-red-500">Almost sold out</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{product.stock} left</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductMarquee;