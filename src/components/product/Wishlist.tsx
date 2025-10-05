import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    title: string;
    price_cents: number;
    main_image_url: string;
    stock: number;
    status: string;
    artist_profiles: {
      artist_name: string;
    };
  };
}

interface WishlistProps {
  isWidget?: boolean;
  limit?: number;
}

export const Wishlist: React.FC<WishlistProps> = ({ isWidget = false, limit }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('wishlists')
        .select(`
          *,
          products(
            id,
            title,
            price_cents,
            main_image_url,
            stock,
            status,
            artist_profiles(artist_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sign in to view your wishlist</h3>
          <p className="text-muted-foreground">
            Save your favorite items for later by creating an account.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className={isWidget ? "space-y-3" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
        {[...Array(isWidget ? 3 : 6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="aspect-square bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start browsing and save items you love.
          </p>
          <Link to="/shop">
            <Button>Browse Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={isWidget ? "space-y-3" : "space-y-6"}>
      {!isWidget && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <Badge variant="outline">{wishlistItems.length} items</Badge>
        </div>
      )}

      <div className={isWidget ? "space-y-3" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative aspect-square mb-3 overflow-hidden rounded">
                <img
                  src={item.products.main_image_url || '/placeholder.svg'}
                  alt={item.products.title}
                  className="w-full h-full object-cover transition-transform"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => removeFromWishlist(item.product_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Link to={`/product/${item.products.id}`}>
                  <h3 className="font-medium truncate hover:text-primary transition-colors">
                    {item.products.title}
                  </h3>
                </Link>

                {item.products.artist_profiles?.artist_name && (
                  <p className="text-sm text-muted-foreground">
                    by {item.products.artist_profiles.artist_name}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.5 (24)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {formatPrice(item.products.price_cents / 100)}
                  </span>
                  
                  {item.products.status === 'published' && item.products.stock > 0 ? (
                    <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isWidget && wishlistItems.length > (limit || 3) && (
        <div className="text-center">
          <Link to="/wishlist">
            <Button variant="outline">View All ({wishlistItems.length})</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

// Hook for wishlist functionality
export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist.",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to wishlist!",
        description: "Item has been saved to your wishlist.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const checkIsInWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  };

  return {
    addToWishlist,
    removeFromWishlist,
    checkIsInWishlist,
  };
};