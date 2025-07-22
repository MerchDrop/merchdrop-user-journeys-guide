import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedArtists = () => {
  const artists = [
    {
      id: 1,
      name: "Alex Rivera",
      handle: "@alexart",
      bio: "Digital artist creating vibrant streetwear designs",
      followers: "25.3K",
      earnings: "$15,200",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      verified: true,
      trending: true
    },
    {
      id: 2,
      name: "Maya Chen",
      handle: "@mayavisuals",
      bio: "Minimalist designer with a focus on sustainable fashion",
      followers: "18.7K",
      earnings: "$12,800",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612c4e3?w=300&h=300&fit=crop&crop=face",
      verified: true,
      trending: false
    },
    {
      id: 3,
      name: "Jordan Blake",
      handle: "@jordanart",
      bio: "Pop culture illustrator and anime enthusiast",
      followers: "32.1K",
      earnings: "$21,400",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      verified: true,
      trending: true
    },
    {
      id: 4,
      name: "Sofia Martinez",
      handle: "@sofiamakes",
      bio: "Abstract artist bringing color to everyday wear",
      followers: "14.2K",
      earnings: "$9,600",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      verified: false,
      trending: false
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured <span className="bg-hero-gradient bg-clip-text text-transparent">Artists</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover talented creators who are building successful brands and earning through their unique designs.
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {artists.map((artist, index) => (
            <Card key={artist.id} className={`hover-lift group cursor-pointer animate-fade-in-up delay-${index + 1}00`}>
              <CardContent className="p-6">
                {/* Artist Image & Status */}
                <div className="relative mb-4">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover"
                  />
                  {artist.trending && (
                    <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground p-1">
                      <TrendingUp className="w-3 h-3" />
                    </Badge>
                  )}
                </div>

                {/* Artist Info */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-semibold">{artist.name}</h3>
                    {artist.verified && (
                      <Star className="w-4 h-4 text-accent fill-accent" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{artist.handle}</p>
                  <p className="text-sm text-muted-foreground">{artist.bio}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div>
                    <div className="font-semibold text-sm">{artist.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-accent">{artist.earnings}</div>
                    <div className="text-xs text-muted-foreground">Earned</div>
                  </div>
                </div>

                {/* View Profile Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  asChild
                >
                  <Link to={`/artist/${artist.handle.slice(1)}`}>
                    View Profile
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/artists">
              Explore All Artists
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;