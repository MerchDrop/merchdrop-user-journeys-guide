
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Users, ExternalLink } from 'lucide-react';
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
    <section className="py-20 lg:py-32 bg-secondary/30" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-foreground">
            Featured Artists
          </h2>
          <p className="text-[16px] lg:text-[18px] text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover talented artists who are building their brands and generating revenue through MerchDrop.
          </p>
        </motion.div>

        {/* Artists Grid - 3 per row for clean layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="feature-card bg-white rounded-lg shadow-design-card border border-border hover:shadow-design-hover transition-design-smooth overflow-hidden">
                {/* Artist Banner */}
                <div className="relative">
                  <img 
                    src={artist.banner} 
                    alt={`${artist.name} banner`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {artist.trending && (
                      <Badge variant="default" className="bg-primary text-primary-foreground text-[12px]">
                        Trending
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-border text-foreground bg-white text-[12px]">
                      {artist.genre}
                    </Badge>
                  </div>
                  <div className="absolute -bottom-6 left-6">
                    <img 
                      src={artist.avatar} 
                      alt={artist.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-design-card"
                    />
                  </div>
                </div>
                
                {/* Artist Info */}
                <div className="pt-8 pb-6 px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[20px] lg:text-[22px] font-bold text-foreground">
                      {artist.name}
                    </h3>
                    <div className="flex items-center text-foreground">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="text-[14px]">{artist.rating}</span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-[14px] font-semibold text-foreground">{artist.followers}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-[14px] font-semibold text-foreground">{artist.revenue}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[14px] font-semibold text-foreground">{artist.products}</span>
                      <p className="text-[12px] text-muted-foreground">Products</p>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    variant="outline" 
                    className="w-full btn-secondary"
                    asChild
                  >
                    <Link to={`/artist/${artist.id}`}>
                      View Profile
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Browse All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16 lg:mt-20"
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="btn-secondary px-8 py-4 text-base"
            asChild
          >
            <Link to="/artists">
              Browse All Artists
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
