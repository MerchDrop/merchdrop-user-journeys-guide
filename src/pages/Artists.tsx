import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Star, MapPin, Palette, Heart } from 'lucide-react';
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

const mockArtists: Artist[] = [
  {
    id: 'maya-rodriguez',
    name: 'Maya Rodriguez',
    handle: '@mayaart',
    bio: 'Digital artist creating vibrant illustrations and character designs. Specializing in fantasy and sci-fi artwork.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b13c?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=200&fit=crop',
    location: 'Los Angeles, CA',
    specialties: ['Digital Art', 'Character Design', 'Fantasy'],
    followers: 12450,
    rating: 4.9,
    totalSales: 15780,
    productCount: 24,
    joined: '2022-03-15',
    isVerified: true,
    topProducts: [
      'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    handle: '@alexcreates',
    bio: 'Minimalist designer with a passion for clean aesthetics and modern art. Creating timeless pieces.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=200&fit=crop',
    location: 'Tokyo, Japan',
    specialties: ['Minimalism', 'Typography', 'Branding'],
    followers: 8920,
    rating: 4.8,
    totalSales: 12340,
    productCount: 18,
    joined: '2021-11-20',
    isVerified: true,
    topProducts: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'jordan-blake',
    name: 'Jordan Blake',
    handle: '@jordanart',
    bio: 'Street artist turned digital creator. Bringing urban culture and bold graphics to merchandise.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1541730314360-5b6b93c5a28b?w=800&h=200&fit=crop',
    location: 'Brooklyn, NY',
    specialties: ['Street Art', 'Graffiti', 'Urban Design'],
    followers: 15680,
    rating: 4.7,
    totalSales: 18920,
    productCount: 31,
    joined: '2020-08-10',
    isVerified: false,
    topProducts: [
      'https://images.unsplash.com/photo-1551298370-9c2d5969ce64?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'sofia-martinez',
    name: 'Sofia Martinez',
    handle: '@sofiamakes',
    bio: 'Abstract artist exploring color, form, and emotion through mixed media and digital art.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=800&h=200&fit=crop',
    location: 'Barcelona, Spain',
    specialties: ['Abstract Art', 'Mixed Media', 'Color Theory'],
    followers: 9870,
    rating: 4.9,
    totalSales: 11250,
    productCount: 22,
    joined: '2022-01-05',
    isVerified: true,
    topProducts: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    handle: '@daviddesigns',
    bio: 'Product designer creating functional and beautiful everyday items with a focus on sustainability.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=200&fit=crop',
    location: 'Seoul, South Korea',
    specialties: ['Product Design', 'Sustainability', 'Industrial'],
    followers: 7430,
    rating: 4.6,
    totalSales: 8950,
    productCount: 16,
    joined: '2023-02-12',
    isVerified: false,
    topProducts: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=100&h=100&fit=crop'
    ]
  },
  {
    id: 'emma-wilson',
    name: 'Emma Wilson',
    handle: '@emmacreates',
    bio: 'Illustrator specializing in botanical and nature-inspired artwork. Creating peaceful, organic designs.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
    location: 'London, UK',
    specialties: ['Botanical Art', 'Nature', 'Watercolor'],
    followers: 11280,
    rating: 4.8,
    totalSales: 13670,
    productCount: 28,
    joined: '2021-09-18',
    isVerified: true,
    topProducts: [
      'https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1574169208507-84376144848b?w=100&h=100&fit=crop'
    ]
  }
];

export default function Artists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const [filterBy, setFilterBy] = useState('all');
  const { formatPrice } = useCurrency();

  const specialtyOptions = ['all', 'digital art', 'minimalism', 'street art', 'abstract art', 'product design', 'botanical art'];

  const filteredArtists = mockArtists
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
                  <span>{mockArtists.length}+ Artists</span>
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