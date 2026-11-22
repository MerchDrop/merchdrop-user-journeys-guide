import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchPublicArtists, type PublicArtistCard } from '@/hooks/useArtistsQuery';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';

const SORTS: Record<string, (a: PublicArtistCard, b: PublicArtistCard) => number> = {
  followers: (a, b) => b.followers - a.followers,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  sales: (a, b) => b.revenue - a.revenue,
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
};

export default function Artists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const { formatPrice } = useCurrency();
  const { data: artists = [], isLoading, isError } = useQuery({
    queryKey: ['artists', 'public'],
    queryFn: () => fetchPublicArtists(),
    staleTime: 5 * 60 * 1000,
  });

  const term = searchTerm.toLowerCase();
  const filteredArtists = artists
    .filter((a) => a.name.toLowerCase().includes(term) || (a.bio ?? '').toLowerCase().includes(term))
    .sort(SORTS[sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEOHelmet title="Artists" description="Browse independent artists on MerchDrop and shop their official merch." />

      <main className="pt-20">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Discover Amazing <span className="bg-hero-gradient bg-clip-text text-transparent">Artists</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our community of creators and find your next favorite artist
            </p>
          </div>
        </section>

        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artists..."
                aria-label="Search artists"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44" aria-label="Sort artists"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="sales">Best Selling</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true">
                {[0, 1, 2].map((i) => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : isError ? (
              <p className="text-center text-muted-foreground py-12">We couldn't load artists. Please refresh the page.</p>
            ) : filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No artists found</h3>
                <p className="text-muted-foreground">Try a different search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArtists.map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}
                  >
                    <Card className="group hover-lift overflow-hidden h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={artist.avatar}
                            alt=""
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover bg-muted"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
                            {artist.rating != null && (
                              <p className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                                {artist.rating}
                              </p>
                            )}
                          </div>
                        </div>

                        {artist.bio && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{artist.bio}</p>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-4 text-center mt-auto">
                          <div>
                            <p className="text-lg font-semibold">{artist.followers.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{artist.products}</p>
                            <p className="text-xs text-muted-foreground">Products</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{formatPrice(artist.revenue)}</p>
                            <p className="text-xs text-muted-foreground">Sales</p>
                          </div>
                        </div>

                        <Button asChild className="w-full">
                          <Link to={`/artist/${encodeURIComponent(artist.slug)}`}>View Profile</Link>
                        </Button>
                      </CardContent>
                    </Card>
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
