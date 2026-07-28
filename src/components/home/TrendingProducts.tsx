import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Flame } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";

interface TrendingProduct {
  id: string;
  name: string;
  artist: string;
  artistHandle: string;
  price: number;
  image: string;
  likes: number;
  sales: number;
  trending: boolean;
  onSale: boolean;
}

const TrendingProducts = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price_cents,
          main_image_url,
          artist_profiles (
            artist_name,
            artist_slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (!error && data && data.length > 0) {
        const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity');
        const { data: wishlists } = await supabase.from('wishlists').select('product_id');

        const salesMap: { [id: string]: number } = {};
        orderItems?.forEach((item) => {
          salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1);
        });

        const likesMap: { [id: string]: number } = {};
        wishlists?.forEach((w) => {
          likesMap[w.product_id] = (likesMap[w.product_id] || 0) + 1;
        });

        const mapped = data.map((p: any) => {
          const totalSales = salesMap[p.id] || 0;
          const totalLikes = likesMap[p.id] || 0;
          const artistName = p.artist_profiles?.artist_name || 'Verified Creator';
          const artistSlug = p.artist_profiles?.artist_slug || artistName.toLowerCase().replace(/\s+/g, '');

          return {
            id: p.id,
            name: p.title,
            artist: artistName,
            artistHandle: `@${artistSlug}`,
            price: (p.price_cents ?? 0) / 100,
            image: p.main_image_url || '/placeholder.svg',
            likes: totalLikes,
            sales: totalSales,
            trending: totalSales >= 5,
            onSale: false,
          };
        });

        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error('Error fetching trending products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-foreground">
            Shop artist drops
          </h2>
          <p className="text-[16px] lg:text-[18px] text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the hottest merchandise from our creative community. From streetwear to accessories, find your perfect style.
          </p>
        </div>

        {/* Products Grid - gallery layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 lg:mb-20">
          {products.map((product, index) => (
            <Card key={product.id} className="group hover-card-lift cursor-pointer transition-design-smooth border border-border bg-white shadow-design-card">
              <CardContent className="p-0">
                
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.trending && (
                      <Badge className="bg-accent text-accent-foreground text-[12px]">
                        <Flame className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {product.onSale && (
                      <Badge className="bg-destructive text-destructive-foreground text-[12px]">
                        Sale
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-2 rounded-full hover:bg-white transition-colors shadow-design-card">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary-hover transition-colors shadow-design-card">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Artist */}
                  <Link 
                    to={`/artist/${product.artistHandle.slice(1)}`}
                    className="text-[13px] text-muted-foreground hover:text-accent transition-colors hover-accent-underline"
                  >
                    by {product.artist}
                  </Link>

                  {/* Product Name */}
                  <h3 className="text-[20px] lg:text-[22px] font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[16px] lg:text-[18px] font-bold text-foreground">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-[14px] text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-[14px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {product.likes}
                    </div>
                    <div>
                      {product.sales} sold
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Button size="lg" className="btn-primary px-8 py-4 text-base" asChild>
            <Link to="/products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;