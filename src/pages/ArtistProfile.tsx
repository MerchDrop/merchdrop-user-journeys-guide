import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Star, Users, TrendingUp, ExternalLink, Instagram, Music, ShoppingCart, Eye } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';

// Mock data - in real app, this would come from API
const artistData = {
  name: "Luna Rivers",
  genre: "Indie Pop",
  bio: "Creating dreamy soundscapes and ethereal visuals. Luna Rivers blends indie pop with electronic elements to create a unique sonic experience that resonates with fans worldwide.",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b151?w=150&h=150&fit=crop&auto=format",
  banner: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop&auto=format",
  followers: "45.2K",
  rating: 4.9,
  totalSales: "2.3K",
  socials: {
    instagram: "@lunariverspop",
    spotify: "Luna Rivers",
    website: "lunariverspop.com"
  }
};

const merchItems = [
  {
    id: 1,
    name: "Midnight Vibes Hoodie",
    price: "$55",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format",
    sales: "340 sold",
    rating: 4.9
  },
  {
    id: 2,
    name: "Ethereal Dreams Tee",
    price: "$35",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&auto=format",
    sales: "523 sold", 
    rating: 4.8
  },
  {
    id: 3,
    name: "Luna Logo Cap",
    price: "$28",
    image: "https://images.unsplash.com/photo-1588117260148-b47c0c19383d?w=400&h=400&fit=crop&auto=format",
    sales: "789 sold",
    rating: 5.0
  },
  {
    id: 4,
    name: "Cosmic Journey Poster",
    price: "$22",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&auto=format",
    sales: "234 sold",
    rating: 4.7
  },
  {
    id: 5,
    name: "Rivers Phone Case",
    price: "$32",
    image: "https://images.unsplash.com/photo-1607212640195-b3c4c0ca5f82?w=400&h=400&fit=crop&auto=format",
    sales: "445 sold",
    rating: 4.9
  },
  {
    id: 6,
    name: "Dreamscape Vinyl Sticker Pack",
    price: "$15",
    image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?w=400&h=400&fit=crop&auto=format",
    sales: "1.2K sold",
    rating: 4.8
  }
];

export default function ArtistProfile() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  // Scroll animation for banner
  const { scrollY } = useScroll();
  const bannerHeight = useTransform(scrollY, [0, 300], ['60vh', '25vh']);
  const bannerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      artist: artistData.name,
      price: parseFloat(item.price.replace('$', '')),
      image: item.image
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Artist Header */}
        <section className="relative">
          {/* Animated Banner */}
          <motion.div 
            className="bg-cover bg-center relative overflow-hidden"
            style={{ 
              backgroundImage: `url(${artistData.banner})`,
              height: bannerHeight,
              opacity: bannerOpacity
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Floating Follow Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 right-8"
            >
              <Button variant="hero" size="lg" className="shadow-glow">
                Follow Artist
              </Button>
            </motion.div>
          </motion.div>

          {/* Artist Info */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-24 md:-mt-32">
              {isLoading ? (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
                  <div className="flex-1 bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card">
                    <Skeleton className="h-10 w-64 mb-4" />
                    <Skeleton className="h-6 w-32 mb-6" />
                    <Skeleton className="h-20 w-full mb-6" />
                    <div className="flex gap-3">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-hero bg-cover bg-center"
                    style={{ backgroundImage: `url(${artistData.avatar})` }}
                  />

                {/* Info */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-1 bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">{artistData.name}</h1>
                      <p className="text-lg text-muted-foreground">{artistData.genre}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="font-bold">{artistData.followers}</span>
                        </div>
                        <span className="text-muted-foreground">Followers</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                          <span className="font-bold">{artistData.rating}</span>
                        </div>
                        <span className="text-muted-foreground">Rating</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-bold">{artistData.totalSales}</span>
                        </div>
                        <span className="text-muted-foreground">Sold</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/80 mb-6 leading-relaxed">
                    {artistData.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Instagram className="h-4 w-4 mr-2" />
                      {artistData.socials.instagram}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      {artistData.socials.spotify}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {artistData.socials.website}
                    </Button>
                  </div>
                </motion.div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Merch Catalog */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Merch Collection
              </h2>
              <p className="text-xl text-muted-foreground">
                Exclusive designs and limited drops from {artistData.name}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {merchItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hero group cursor-pointer relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{ transform: hoveredItem === item.id ? 'translateY(-8px)' : 'translateY(0px)' }}
                  >
                    <div className="aspect-square bg-cover bg-center relative overflow-hidden"
                         style={{ backgroundImage: `url(${item.image})` }}>
                      
                      {/* Hover Overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredItem === item.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </motion.div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <div className="flex items-center text-xs">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="font-semibold">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{item.price}</span>
                        <span className="text-xs text-muted-foreground">{item.sales}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}