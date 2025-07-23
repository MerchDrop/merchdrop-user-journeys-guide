
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
    <section className="py-20 bg-gray-50 text-black" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-black">
            Featured Artists
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover talented artists who are building their brands and generating revenue through MerchDrop.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={artist.banner} 
                      alt={`${artist.name} banner`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {artist.trending && (
                        <Badge variant="default" className="bg-black text-white">
                          Trending
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-black text-black bg-white">
                        {artist.genre}
                      </Badge>
                    </div>
                    <div className="absolute -bottom-6 left-6">
                      <img 
                        src={artist.avatar} 
                        alt={artist.name}
                        className="w-12 h-12 rounded-full border-2 border-white"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-8 pb-6 px-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-black">{artist.name}</h3>
                      <div className="flex items-center text-black">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="text-sm">{artist.rating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-black mr-1" />
                          <span className="text-sm font-semibold text-black">{artist.followers}</span>
                        </div>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-black mr-1" />
                          <span className="text-sm font-semibold text-black">{artist.revenue}</span>
                        </div>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-black">{artist.products}</span>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-black text-black hover:bg-black hover:text-white"
                      asChild
                    >
                      <Link to={`/artist/${artist.id}`}>
                        View Profile
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg"
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
