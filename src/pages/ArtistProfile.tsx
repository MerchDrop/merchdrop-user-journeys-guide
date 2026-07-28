import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Star, Users, TrendingUp, ExternalLink, Instagram, Music, ShoppingCart, Eye, User as UserIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeImageUrl } from '@/lib/image-utils';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useArtistProfileBySlug } from '@/hooks/useArtistProfileBySlug';
import { useProductsQuery, Product } from '@/hooks/useProductsQuery';
import { ArtistFollow } from '@/components/artist/ArtistFollow';

export default function ArtistProfile() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: artist, isLoading: artistLoading } = useArtistProfileBySlug(slug);
  const { data: products = [], isLoading: productsLoading } = useProductsQuery({
    artist: artist?.id,
    published: true,
  });

  const isLoading = artistLoading || (!!artist && productsLoading);

  // Scroll animation for banner
  const { scrollY } = useScroll();
  const bannerHeight = useTransform(scrollY, [0, 300], ['60vh', '25vh']);
  const bannerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.title,
      artist: artist?.artist_name,
      artistId: artist?.id,
      price: product.price_cents / 100,
      image: product.main_image_url || product.product_images?.[0]?.url || '/placeholder.svg',
    });
  };

  if (!artistLoading && !artist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find an artist at this address.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Artist Header */}
        <section className="relative">
          {/* Banner (gradient — no artist banner image in the data model yet) */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-muted"
            style={{
              height: bannerHeight,
              opacity: bannerOpacity
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Floating Follow Button */}
            {artist && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 right-8"
              >
                <ArtistFollow artistId={artist.id} />
              </motion.div>
            )}
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
              ) : artist && (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-hero bg-cover bg-center bg-muted flex items-center justify-center"
                    style={sanitizeImageUrl(artist.avatar_url, '') ? { backgroundImage: `url(${sanitizeImageUrl(artist.avatar_url)})` } : undefined}
                  >
                    {!sanitizeImageUrl(artist.avatar_url, '') && <UserIcon className="h-16 w-16 text-muted-foreground" />}
                  </motion.div>

                  {/* Info */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{artist.artist_name}</h1>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="font-bold">{artist.followerCount.toLocaleString()}</span>
                          </div>
                          <span className="text-muted-foreground">Followers</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                            <span className="font-bold">
                              {artist.averageRating !== null ? artist.averageRating.toFixed(1) : 'New'}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {artist.reviewCount > 0 ? `${artist.reviewCount} reviews` : 'Rating'}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="font-bold">{artist.total_sales.toLocaleString()}</span>
                          </div>
                          <span className="text-muted-foreground">Sold</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground/80 mb-6 leading-relaxed">
                      {artist.bio || 'This artist hasn\'t added a bio yet.'}
                    </p>

                    {/* Social Links */}
                    {(artist.social_links?.instagram || artist.social_links?.spotify || artist.website_url) && (
                      <div className="flex flex-wrap gap-3">
                        {artist.social_links?.instagram && (
                          <Button variant="outline" size="sm" className="flex items-center" asChild>
                            <a href={`https://instagram.com/${artist.social_links.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
                              <Instagram className="h-4 w-4 mr-2" />
                              {artist.social_links.instagram}
                            </a>
                          </Button>
                        )}
                        {artist.social_links?.spotify && (
                          <Button variant="outline" size="sm" className="flex items-center" asChild>
                            <a href={`https://open.spotify.com/search/${encodeURIComponent(artist.social_links.spotify)}`} target="_blank" rel="noreferrer">
                              <Music className="h-4 w-4 mr-2" />
                              {artist.social_links.spotify}
                            </a>
                          </Button>
                        )}
                        {artist.website_url && (
                          <Button variant="outline" size="sm" className="flex items-center" asChild>
                            <a href={artist.website_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {artist.website_url}
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
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
              {artist && (
                <p className="text-xl text-muted-foreground">
                  Exclusive designs and limited drops from {artist.artist_name}
                </p>
              )}
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
            ) : products.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No products yet. Check back soon!
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product, index) => {
                  const image = sanitizeImageUrl(product.main_image_url || product.product_images?.[0]?.url);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hero group cursor-pointer relative"
                      onMouseEnter={() => setHoveredItem(product.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{ transform: hoveredItem === product.id ? 'translateY(-8px)' : 'translateY(0px)' }}
                    >
                      <div className="aspect-square bg-cover bg-center relative overflow-hidden"
                           style={{ backgroundImage: `url(${image})` }}>

                        {/* Hover Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-black/60 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredItem === product.id ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white" asChild>
                              <a href={`/product/${product.slug || product.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </motion.div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">{formatPrice(product.price_cents / 100)}</span>
                          {product.stock <= 0 ? (
                            <span className="text-xs text-red-500 font-semibold">Sold Out</span>
                          ) : product.stock <= 10 ? (
                            <span className="text-xs text-red-500">Almost sold out</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{product.stock} left</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
