import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Eye, Minus, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { ProductReviews } from '@/components/product/ProductReviews';

import { supabase } from '@/integrations/supabase/client';
import { sanitizeImageUrl } from '@/lib/image-utils';

type UiProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  features?: string[];
  images: string[];
  sizes?: string[];
  colors?: { name: string; value: string }[];
  stock: number;
  category?: string;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredRelated, setHoveredRelated] = useState<string | null>(null);

  // Load from Supabase
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const identifier = id as string;
      if (!identifier) { if (isMounted) setIsLoading(false); return; }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      const selectQuery = `
        id,
        title,
        description,
        price_cents,
        currency,
        stock,
        main_image_url,
        tags,
        artist_id,
        category_id,
        category:categories(name, slug),
        artist_profiles(artist_name, artist_slug),
        product_images(url, sort_order)
      `;

      let productRes = await supabase
        .from('products')
        .select(selectQuery)
        .eq(isUuid ? 'id' : 'slug', identifier)
        .eq('status', 'published')
        .maybeSingle();

      if (!productRes.data && !productRes.error) {
        productRes = await supabase
          .from('products')
          .select(selectQuery)
          .eq(isUuid ? 'slug' : 'id', identifier)
          .eq('status', 'published')
          .maybeSingle();
      }

      const data = productRes.data;
      const error = productRes.error;

      if (!error && data && isMounted) {
        const reviewRows = await supabase.from('reviews').select('rating').eq('product_id', data.id).then(r => r.data || []);
        const imageList = [
          ...(data.main_image_url ? [data.main_image_url] : []),
          ...(((data as any).product_images as any[] | undefined)?.sort((a,b)=> (a.sort_order ?? 0)-(b.sort_order ?? 0)).map((i)=> i.url) || [])
        ];
        const sanitizedList = imageList
          .map((img) => sanitizeImageUrl(img))
          .filter((img) => img !== '/placeholder.svg');
        const finalImages = sanitizedList.length > 0 ? sanitizedList : ['/placeholder.svg'];

        const ratings = (reviewRows || []).map(r => r.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        const mapped: any = {
          id: data.id,
          name: (data as any).title,
          price: ((data as any).price_cents ?? 0) / 100,
          description: (data as any).description ?? 'High-quality product crafted with care.',
          features: [
            'Premium materials',
            'Unique design',
            'Handcrafted quality',
            'Perfect for gifting'
          ],
          images: finalImages,
          stock: (data as any).stock ?? 0,
          rating: averageRating,
          reviews: ratings.length,
          artist: (data as any).artist_profiles?.artist_name,
          artistId: (data as any).artist_id, // Extract artist_id for cart
          artistSlug: (data as any).artist_profiles?.artist_slug,
          category: (data as any).category?.name,
          categoryId: (data as any).category_id,
          tags: (data as any).tags || [],
          colors: (data as any).variants?.colors || (data as any).colors || [],
          sizes: (data as any).variants?.sizes || (data as any).sizes || [],
        };
        setProduct(mapped);
        if (mapped.colors && mapped.colors.length > 0) {
          setSelectedColor(0);
        }
        if (mapped.sizes && mapped.sizes.length > 0) {
          setSelectedSize(mapped.sizes[0]);
        }
      } else {
        if (error) console.error('Error loading product', error);
        if (isMounted) setProduct(null);
      }
      if (isMounted) setIsLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const activeColorObj = product.colors && product.colors[selectedColor];
    const activeColorName = typeof activeColorObj === 'string' ? activeColorObj : activeColorObj?.name;

    addItem({
      id: product.id,
      name: product.name,
      artist: product.artist,
      artistId: product.artistId, // Pass artist ID from product data
      price: product.price,
      image: product.images[0],
      size: selectedSize || undefined,
      color: activeColorName || undefined
    }, quantity);

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const nextImage = () => {
    if (product) {
      setSelectedImage((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // Related products: real, published products in same category (or other categories), excluding current product
  const { data: allPublishedProducts = [] } = useProductsQuery({ published: true });

  const relatedProducts = React.useMemo(() => {
    if (!product?.id || !allPublishedProducts.length) return [];

    const validProducts = allPublishedProducts.filter(
      p => p.id !== product.id && p.status === 'published'
    );

    if (product.categoryId) {
      const sameCategory = validProducts.filter(
        p => p.category_id === product.categoryId || p.category?.id === product.categoryId
      );
      if (sameCategory.length > 0) {
        return sameCategory.slice(0, 4);
      }
    }

    return validProducts.slice(0, 4);
  }, [product?.id, product?.categoryId, allPublishedProducts]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="aspect-square rounded-3xl" />
                <div className="flex gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 h-20 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-foreground">Products</Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 bg-cover bg-center shadow-hero group"
                   style={{ backgroundImage: `url(${product.images[selectedImage]})` }}>
                
                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Wishlist Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm ${isLiked ? 'text-red-500' : ''}`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-4">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-xl bg-cover bg-center border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  {product.artist && product.artistSlug ? (
                    <Link to={`/artist/${product.artistSlug}`}>
                      <Badge variant="secondary" className="mb-2 hover:bg-secondary/80">By {product.artist}</Badge>
                    </Link>
                  ) : null}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold">
                      {product.reviews > 0 ? product.rating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-muted-foreground ml-2">({product.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                      <Badge variant="destructive">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-2">
                  {product.stock > 10 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {product.stock} in stock
                    </Badge>
                  ) : product.stock > 0 ? (
                    <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                      Almost sold out
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-foreground/80 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Color:</h3>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((color: any, index: number) => {
                      const colorName = typeof color === 'string' ? color : color?.name || 'Color';
                      const colorValue = typeof color === 'string' ? color : color?.value || '#000000';
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(index)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === index ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-muted'
                          }`}
                          style={{ backgroundColor: colorValue }}
                          title={colorName}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    {(() => {
                      const active = product.colors[selectedColor];
                      if (!active) return '';
                      return typeof active === 'string' ? active : active.name || '';
                    })()}
                  </p>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && (
                <div>
                  <h3 className="font-semibold mb-3">Size:</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {product.sizes.map((size: string) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => setSelectedSize(size)}
                        className="aspect-square"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Quantity:</h3>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - {formatPrice(product.price * quantity)}
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Buy Now
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 mr-3" />
                  Free shipping on orders over {formatPrice(50)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-3" />
                  Secure checkout with SSL encryption
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4 mr-3" />
                  30-day return policy
                </div>
              </div>
            </motion.div>
          </div>

          {/* You May Also Like Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 space-y-8"
          >
            {relatedProducts.length > 0 && (
              <>
                <h2 className="text-3xl font-bold">Other products you might like</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedProducts.map((item, index) => {
                    const image = item.main_image_url || item.product_images?.[0]?.url || '/placeholder.svg';
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        onMouseEnter={() => setHoveredRelated(item.id)}
                        onMouseLeave={() => setHoveredRelated(null)}
                      >
                        <Card className="group cursor-pointer hover:shadow-hero transition-all duration-300 overflow-hidden">
                          <Link to={`/product/${item.slug || item.id}`}>
                            <div className="aspect-square overflow-hidden relative">
                              <img
                                src={image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300"
                              />

                              {/* Hover Overlay */}
                              <motion.div
                                className="absolute inset-0 bg-black/60 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredRelated === item.id ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </motion.div>
                            </div>

                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">{item.artist_profiles?.artist_name}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-primary">{formatPrice(item.price_cents / 100)}</span>
                                {item.stock <= 0 ? (
                                  <span className="text-xs text-red-500 font-semibold">Sold Out</span>
                                ) : item.stock <= 10 ? (
                                  <span className="text-xs text-red-500">Almost sold out</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">{item.stock} left</span>
                                )}
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.section>

          {/* Reviews Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20"
          >
            <ProductReviews
              productId={product.id}
              averageRating={product.rating}
              totalReviews={product.reviews}
            />
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}