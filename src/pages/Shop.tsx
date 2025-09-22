import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCurrency } from '@/context/CurrencyContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import fashionSlider1 from '@/assets/fashion-slider-1.jpg';
import fashionSlider2 from '@/assets/fashion-slider-2.jpg';
import fashionSlider3 from '@/assets/fashion-slider-3.jpg';
import SEOHelmet from '@/components/SEO/SEOHelmet';

const ShopHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [fashionSlider1, fashionSlider2, fashionSlider3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image Slider */}
      {sliderImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      
      {/* Content */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 text-center text-white px-4 max-w-4xl w-full">
        <div className="mb-12">
          <p className="text-lg mb-4 text-white/90">EXPLORE OUR NEW MERCH</p>
        </div>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="default" 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            asChild
          >
            <Link to="/products">Shop Now</Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold backdrop-blur-sm"
            asChild
          >
            <Link to="/creators">I'm an Artist/Creative</Link>
          </Button>
        </div>
      </div>
      
      {/* Slider indicator dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

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
      product.title.toLowerCase().includes(filter) || 
      product.description?.toLowerCase().includes(filter)
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
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
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

  return (
    <div className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Shop by Category</h2>
          <p className="text-lg text-muted-foreground">Discover unique merchandise from talented creators</p>
        </div>
        
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.filter);
          
          if (categoryProducts.length === 0) return null;
          
          return (
            <div key={category.name} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-foreground">{category.name}</h3>
                <Button variant="outline" asChild>
                  <Link to={`/products?category=${category.filter}`}>View All</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product) => {
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
                            src={product.artist_profiles?.artist_name ? '/placeholder.svg' : '/placeholder.svg'}
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
                            to={`/product/${product.slug || product.id}`}
                            className="block"
                          >
                            <h3 className="font-medium text-foreground hover:text-accent transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-foreground">
                                {formatPrice(product.price_cents)}
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
          );
        })}
      </div>
    </div>
  );
};

const Shop = () => {
  return (
    <>
      <SEOHelmet 
        title="Shop - MerchDrop | Unique Artist Merchandise"
        description="Discover and shop unique merchandise from talented artists and creators. Find t-shirts, hoodies, accessories, and prints from your favorite artists."
        keywords="shop merchandise, artist merch, custom t-shirts, hoodies, accessories, prints"
      />
      <div className="min-h-screen bg-background">
        {/* Top Scrolling Banner */}
        <div className="w-full bg-black text-white py-2 overflow-hidden relative z-50">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-sm font-medium px-8">SUMMER SCORCH MERCH OUT NOW!!!</span>
            <span className="text-sm font-medium px-8">SUMMER SCORCH MERCH OUT NOW!!!</span>
            <span className="text-sm font-medium px-8">SUMMER SCORCH MERCH OUT NOW!!!</span>
            <span className="text-sm font-medium px-8">SUMMER SCORCH MERCH OUT NOW!!!</span>
            <span className="text-sm font-medium px-8">SUMMER SCORCH MERCH OUT NOW!!!</span>
          </div>
        </div>
        
        <Header transparent />
        <main>
          <ShopHeroSection />
        </main>
      </div>
    </>
  );
};

export default Shop;