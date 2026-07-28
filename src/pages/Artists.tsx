import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Star, MapPin, Palette, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  banner: string;
  location: string;
  specialties: string[];
  followers: number;
  rating: number;
  totalSales: number;
  productCount: number;
  joined: string;
  isVerified: boolean;
  topProducts: string[];
}



export default function Artists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const [filterBy, setFilterBy] = useState('all');
  const { formatPrice } = useCurrency();

  const specialtyOptions = ['all', 'digital art', 'minimalism', 'street art', 'abstract art', 'product design', 'botanical art'];

  const filteredArtists = artists
    .filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          artist.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          artist.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                          artist.specialties.some(specialty => 
                            specialty.toLowerCase().includes(filterBy.toLowerCase())
                          );
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return b.followers - a.followers;
        case 'rating':
          return b.rating - a.rating;
        case 'sales':
          return b.totalSales - a.totalSales;
        case 'newest':
          return new Date(b.joined).getTime() - new Date(a.joined).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Discover Amazing <span className="bg-hero-gradient bg-clip-text text-transparent">Artists</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Browse through our community of talented creators and find your next favorite artist
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{artists.length}+ Artists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Multiple Specialties</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Top Rated</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty === 'all' ? 'All Specialties' : specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followers">Most Followers</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="sales">Best Selling</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="group hover-lift cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      {/* Banner */}
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={artist.banner}
                          alt={`${artist.name} banner`}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          {artist.isVerified && (
                            <Badge className="bg-primary text-primary-foreground">
                              Verified
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Artist Info */}
                      <div className="p-6">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-start space-x-4 mb-4">
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md -mt-8 relative z-10"
                          />
                          <div className="flex-1 pt-2">
                            <h3 className="font-semibold text-lg">{artist.name}</h3>
                            <p className="text-muted-foreground text-sm">{artist.handle}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{artist.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {artist.bio}
                        </p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {artist.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {artist.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{artist.specialties.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Top Products Preview */}
                        <div className="flex space-x-2 mb-4">
                          {artist.topProducts.map((product, idx) => (
                            <img
                              key={idx}
                              src={product}
                              alt={`Product ${idx + 1}`}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ))}
                          {artist.productCount > 2 && (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs font-medium">
                              +{artist.productCount - 2}
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-lg font-semibold">{artist.followers.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{formatPrice(artist.totalSales)}</p>
                            <p className="text-xs text-muted-foreground">Sales</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold flex items-center justify-center">
                              <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                              {artist.rating}
                            </p>
                            <p className="text-xs text-muted-foreground">Rating</p>
                          </div>
                        </div>

                        {/* CTA */}
                        <Button asChild className="w-full">
                          <Link to={`/artist/${artist.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredArtists.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No artists found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}