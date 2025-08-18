import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { usePendingArtists, useArtists } from '@/hooks/useArtists';

export const ArtistApprovalCard = () => {
  const { pendingArtists, loading } = usePendingArtists();
  const { approveArtist, rejectArtist } = useArtists();

  const handleApprove = async (artistId: string, artistName: string) => {
    await approveArtist(artistId);
  };

  const handleReject = async (artistId: string, artistName: string) => {
    await rejectArtist(artistId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading artist applications...</span>
        </CardContent>
      </Card>
    );
  }

  if (pendingArtists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Artist Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No pending artist applications at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Artist Applications ({pendingArtists.length})</CardTitle>
        </CardHeader>
      </Card>
      
      {pendingArtists.map((artist) => (
        <Card key={artist.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={artist.avatar_url || '/placeholder.svg'} alt={artist.artist_name} />
                  <AvatarFallback>
                    {(artist.display_name || artist.artist_name).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{artist.artist_name}</CardTitle>
                  <p className="text-muted-foreground">{artist.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Applied on {formatDate(artist.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">{artist.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {artist.bio && (
              <div>
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-muted-foreground">{artist.bio}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">Commission Rate</h4>
              <p className="text-muted-foreground">{artist.commission_rate}%</p>
            </div>

            {artist.website_url && (
              <div>
                <h4 className="font-semibold mb-2">Portfolio</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href={artist.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Portfolio
                  </a>
                </Button>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="default"
                onClick={() => handleApprove(artist.id, artist.artist_name)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(artist.id, artist.artist_name)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArtistApprovalCard;