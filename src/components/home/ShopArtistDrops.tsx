import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ShoppingBag, ArrowRight, Flame, Sparkles, Star, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  title: string;
  price_cents: number;
  main_image_url: string | null;
  slug: string;
  description: string | null;
  published_at: string | null;
  stock: number;
  artist_profiles: {
    artist_name: string;
    artist_slug: string;
    user_id: string;
    profiles: {
      avatar_url: string | null;
      display_name: string | null;
    } | null;
  } | null;
}

const ShopArtistDrops = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            title,
            price_cents,
            main_image_url,
            slug,
            description,
            published_at,
            stock,
            artist_profiles!inner (
              artist_name,
              artist_slug,
              user_id,
              profiles (
                avatar_url,
                display_name
              )
            )
          `)
          .eq('status', 'published')
          .not('artist_profiles.artist_name', 'is', null)
          .order('published_at', { ascending: false })
          .limit(9);

        if (error) {
          console.error('Error fetching products:', error);
          setError('Failed to load products');
          return;
        }

        setProducts(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getBadge = (product: Product) => {
    const now = new Date();
    const publishedAt = new Date(product.published_at || '');
    const daysSincePublished = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePublished <= 7) {
      return { icon: Sparkles, text: "New" };
    } else if (product.stock <= 10) {
      return { icon: Flame, text: "Limited" };
    } else {
      return { icon: Star, text: "Best seller" };
    }
  };

  const formatPrice = (priceCents: number) => {
    return Math.floor(priceCents / 100);
  };

  const getProductImage = (imageUrl: string | null) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1520975922284-9e0ce8272aa9?q=80&w=1600&auto=format&fit=crop";
    }
    
    // If it's a Supabase storage URL, use it directly
    if (imageUrl.includes('supabase')) {
      return imageUrl;
    }
    
    // Otherwise, assume it's in our storage bucket
    return `https://fnipjjcqlpklyuaduwml.supabase.co/storage/v1/object/public/product-images/${imageUrl}`;
  };

  const getArtistAvatar = (avatarUrl: string | null) => {
    if (!avatarUrl) {
      return "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop";
    }
    return avatarUrl;
  };

  const getProductVariants = (description: string | null) => {
    // Simple logic to extract variant info from description
    // In a real app, this would come from the variants JSONB field
    return description?.includes('•') ? description.split('•')[1]?.trim() : "Multiple options";
  };

  if (loading) {
    return (
      <section id="shop" className="relative" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                Shop
              </div>
              <h2 className="text-2xl md:text-3xl tracking-tight mt-1 font-medium text-foreground">
                Shop artist drops
              </h2>
              <p className="text-[13px] mt-1 text-muted-foreground">
                Popular right now — limited runs and fresh releases.
              </p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border overflow-hidden border-border bg-card">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="p-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="shop" className="relative" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section id="shop" className="relative" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="text-center">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              Shop
            </div>
            <h2 className="text-2xl md:text-3xl tracking-tight mt-1 font-medium text-foreground">
              Shop artist drops
            </h2>
            <p className="text-[13px] mt-1 text-muted-foreground">
              Popular right now — limited runs and fresh releases.
            </p>
          </div>
          <Link 
            to="/products" 
            className="hidden md:inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all drops
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product, index) => {
            const badge = getBadge(product);
            const BadgeIcon = badge.icon;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
              >
                <Link 
                  to={`/product/${product.slug}`}
                  className="group rounded-xl border overflow-hidden hover:shadow-sm transition-all hover:-translate-y-0.5 border-border bg-card block"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] bg-muted">
                    <img 
                      src={getProductImage(product.main_image_url)} 
                      alt={`${product.title} by ${product.artist_profiles?.artist_name || 'Unknown Artist'}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Badge */}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-background/90 border-border text-muted-foreground">
                      <BadgeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {badge.text}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-[13px] font-medium shadow-sm bg-background text-foreground border-border">
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                        View product
                      </span>
                      <button className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background border-border hover:bg-muted transition-colors">
                        <Heart className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <img 
                        src={getArtistAvatar(product.artist_profiles?.profiles?.avatar_url)} 
                        alt={`${product.artist_profiles?.artist_name || 'Unknown Artist'} avatar`}
                        className="h-6 w-6 rounded-full border border-border"
                      />
                      <span className="text-[13px] text-muted-foreground">
                        {product.artist_profiles?.artist_name || 'Unknown Artist'}
                      </span>
                      <span className="ml-auto text-[13px] font-medium text-foreground">
                        ${formatPrice(product.price_cents)}
                      </span>
                    </div>
                    <div className="mt-1 text-[14px] font-medium text-foreground">
                      {product.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {getProductVariants(product.description)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex justify-center md:hidden"
        >
          <Link 
            to="/products"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all drops
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopArtistDrops;