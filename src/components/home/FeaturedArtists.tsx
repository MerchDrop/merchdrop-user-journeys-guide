
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Users, ExternalLink, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeaturedArtists = () => {
  const artists = [
    {
      id: 1,
      name: "Luna Waves",
      genre: "Electronic",
      avatar: "/placeholder.svg",
      banner: "/placeholder.svg",
      followers: "45.2K",
      revenue: "$12,450",
      products: 8,
      rating: 4.9,
      trending: true
    },
    {
      id: 2,
      name: "Midnight Rebels",
      genre: "Rock",
      avatar: "/placeholder.svg",
      banner: "/placeholder.svg",
      followers: "32.8K",
      revenue: "$8,920",
      products: 12,
      rating: 4.8,
      trending: false
    },
    {
      id: 3,
      name: "Neon Dreams",
      genre: "Synthwave",
      avatar: "/placeholder.svg",
      banner: "/placeholder.svg",
      followers: "28.1K",
      revenue: "$15,780",
      products: 6,
      rating: 4.9,
      trending: true
    }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="artists" className="relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        
        {/* Section Header - Following ShopArtistDrops format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
              <Crown className="w-4 h-4" strokeWidth={1.5} />
              Featured
            </div>
            <h2 className="text-2xl md:text-3xl tracking-tight mt-1 font-medium text-foreground">
              Featured artists
            </h2>
            <p className="text-[13px] mt-1 text-muted-foreground">
              Discover talented artists building their brands and generating revenue.
            </p>
          </div>
          <Link 
            to="/artists" 
            className="hidden md:inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all artists
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>

        {/* Artists Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
            >
              <Link 
                to={`/artist/${artist.id}`}
                className="group rounded-xl border overflow-hidden hover:shadow-sm transition-all hover:-translate-y-0.5 border-border bg-card block"
              >
                {/* Artist Banner */}
                <div className="relative aspect-[4/3] bg-muted">
                  <img 
                    src={artist.banner} 
                    alt={`${artist.name} banner`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {artist.trending && (
                      <div className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-background/90 border-border text-muted-foreground">
                        <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Trending
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-background/90 border-border text-muted-foreground">
                      {artist.genre}
                    </div>
                  </div>
                  
                  {/* Artist Avatar */}
                  <div className="absolute -bottom-6 left-3">
                    <img 
                      src={artist.avatar} 
                      alt={`${artist.name} avatar`}
                      className="w-12 h-12 rounded-full border-2 border-background shadow-sm"
                    />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-[13px] font-medium shadow-sm bg-background text-foreground border-border">
                      <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      View profile
                    </span>
                  </div>
                </div>
                
                {/* Artist Info */}
                <div className="p-4 border-t border-border pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[18px] font-semibold text-foreground">
                      {artist.name}
                    </h3>
                    <div className="ml-auto flex items-center text-foreground">
                      <Star className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                      <span className="text-[13px] font-medium">{artist.rating}</span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-[13px] font-medium text-foreground">{artist.followers}</div>
                      <div className="text-[11px] text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-medium text-foreground">{artist.revenue}</div>
                      <div className="text-[11px] text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-medium text-foreground">{artist.products}</div>
                      <div className="text-[11px] text-muted-foreground">Products</div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex justify-center md:hidden"
        >
          <Link 
            to="/artists"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all artists
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
