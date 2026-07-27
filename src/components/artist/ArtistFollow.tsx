import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Heart, User, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  artist_slug: string;
  total_sales: number;
  total_earnings: number;
  status: string;
  approval_date: string;
  created_at: string;
  followers_count?: number;
  products_count?: number;
  average_rating?: number;
}

interface ArtistFollowProps {
  artistId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

interface ArtistCardProps {
  artist: Artist;
  showFollowButton?: boolean;
}

export const ArtistFollow: React.FC<ArtistFollowProps> = ({ artistId, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkFollowStatus();
  }, [artistId, user]);

  const checkFollowStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('artist_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('artist_id', artistId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow artists.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('artist_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('artist_id', artistId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this artist.",
        });
        onFollowChange?.(false);
      } else {
        const { error } = await supabase
          .from('artist_follows')
          .insert({
            user_id: user.id,
            artist_id: artistId,
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Following!",
          description: "You are now following this artist.",
        });
        onFollowChange?.(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <Skeleton className="h-9 w-20" />;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={toggleFollow}
      className="flex items-center gap-2"
    >
      <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, showFollowButton = true }) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Artist Avatar */}
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Artist Name and Status */}
            <div className="flex items-center justify-between mb-2">
              <Link to={`/artist/${artist.artist_slug}`}>
                <h3 className="font-semibold text-lg truncate hover:text-primary transition-colors">
                  {artist.artist_name}
                </h3>
              </Link>
              {showFollowButton && <ArtistFollow artistId={artist.id} />}
            </div>

            {/* Artist Stats */}
            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Sales: {artist.total_sales || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{artist.average_rating !== undefined ? artist.average_rating.toFixed(1) : 'New'}</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {artist.products_count || 0} Products
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {artist.followers_count || 0} Followers
                </Badge>
              </div>
              
              <Badge 
                variant={artist.status === 'approved' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {artist.status}
              </Badge>
            </div>

            {/* Join Date */}
            <p className="text-xs text-muted-foreground mt-2">
              Joined {new Date(artist.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ArtistGrid: React.FC<{ searchQuery?: string; limit?: number }> = ({ 
  searchQuery = '', 
  limit 
}) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtists();
  }, [searchQuery, limit]);

  const loadArtists = async () => {
    try {
      let query = supabase
        .from('artist_profiles')
        .select('*')
        .eq('status', 'approved')
        .order('total_sales', { ascending: false });

      if (searchQuery) {
        query = query.ilike('artist_name', `%${searchQuery}%`);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const artistRows = data || [];
      const artistIds = artistRows.map(a => a.id);

      // Real per-artist counts: followers, published products, and average review rating
      const [followsResult, productsResult, reviewsResult] = await Promise.all([
        supabase.from('artist_follows').select('artist_id').in('artist_id', artistIds),
        supabase.from('products').select('artist_id').eq('status', 'published').in('artist_id', artistIds),
        supabase.from('reviews').select('rating, products!inner(artist_id)').in('products.artist_id', artistIds),
      ]);

      const followersByArtist: Record<string, number> = {};
      (followsResult.data || []).forEach(f => {
        followersByArtist[f.artist_id] = (followersByArtist[f.artist_id] || 0) + 1;
      });

      const productsByArtist: Record<string, number> = {};
      (productsResult.data || []).forEach(p => {
        productsByArtist[p.artist_id] = (productsByArtist[p.artist_id] || 0) + 1;
      });

      const ratingsByArtist: Record<string, number[]> = {};
      (reviewsResult.data || []).forEach((r: any) => {
        const artistId = r.products?.artist_id;
        if (!artistId) return;
        ratingsByArtist[artistId] = ratingsByArtist[artistId] || [];
        ratingsByArtist[artistId].push(r.rating);
      });

      const enrichedArtists = artistRows.map(artist => {
        const ratings = ratingsByArtist[artist.id] || [];
        return {
          ...artist,
          followers_count: followersByArtist[artist.id] || 0,
          products_count: productsByArtist[artist.id] || 0,
          average_rating: ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : undefined,
        };
      });

      setArtists(enrichedArtists);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No artists found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No artists match "${searchQuery}"`
              : 'No artists are currently available.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {artists.map(artist => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
};

// Hook for artist follow functionality
export const useArtistFollow = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const getFollowedArtists = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('artist_follows')
        .select(`
          artist_id,
          artist_profiles(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading followed artists:', error);
      return [];
    }
  };

  const getFollowersCount = async (artistId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('artist_follows')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  };

  return {
    getFollowedArtists,
    getFollowersCount,
  };
};