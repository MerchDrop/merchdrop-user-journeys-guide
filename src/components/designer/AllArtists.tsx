import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useArtists } from '@/hooks/useArtistsQuery';
import { Search, Users, ExternalLink, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AllArtists = () => {
  const { artists, loading } = useArtists();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtists = artists.filter(artist =>
    artist.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artist_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Artists</h1>
          <p className="text-muted-foreground">Discover artists to collaborate with</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{artists.length} artists</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No artists found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'No artists are currently available.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(artist.artist_name)}&background=random`} />
                    <AvatarFallback className="text-lg">
                      {artist.artist_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{artist.artist_name}</h3>
                    <p className="text-sm text-muted-foreground">@{artist.artist_slug}</p>
                    <Badge 
                      variant={artist.status === 'approved' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {artist.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Sales</p>
                      <p className="font-medium">${(artist.total_sales || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission</p>
                      <p className="font-medium">{artist.commission_rate || 15}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Link to={`/designer/upload?artist=${artist.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Design
                      </Button>
                    </Link>
                    <Link to={`/artist/${artist.artist_slug}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload CTA */}
      {filteredArtists.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Share Your Creativity?</h3>
            <p className="text-muted-foreground mb-4">
              Choose an artist and upload your design to get started
            </p>
            <Link to="/designer/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Design
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};