import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for pending artist applications
const mockArtistApplications = [
  {
    id: '1',
    name: 'Maya Rodriguez',
    email: 'maya@example.com',
    portfolio: 'https://mayaart.com',
    bio: 'Digital artist specializing in fantasy illustrations and character design.',
    experience: '5+ years',
    submittedDate: '2024-01-20',
    avatar: '/placeholder.svg',
    samples: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex@example.com',
    portfolio: 'https://alexdesigns.com',
    bio: 'Graphic designer with expertise in logo design and brand identity.',
    experience: '3+ years',
    submittedDate: '2024-01-18',
    avatar: '/placeholder.svg',
    samples: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
];

export const ArtistApprovalCard = () => {
  const { toast } = useToast();

  const handleApprove = (artistId: string, artistName: string) => {
    // TODO: Call API to approve artist
    toast({
      title: "Artist Approved",
      description: `${artistName} has been approved as an artist.`,
    });
  };

  const handleReject = (artistId: string, artistName: string) => {
    // TODO: Call API to reject artist
    toast({
      title: "Artist Rejected",
      description: `${artistName}'s application has been rejected.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      {mockArtistApplications.map((artist) => (
        <Card key={artist.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={artist.avatar} alt={artist.name} />
                  <AvatarFallback>
                    {artist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{artist.name}</CardTitle>
                  <p className="text-muted-foreground">{artist.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Applied on {artist.submittedDate}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Bio</h4>
              <p className="text-muted-foreground">{artist.bio}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Experience</h4>
              <p className="text-muted-foreground">{artist.experience}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Portfolio</h4>
              <Button variant="outline" size="sm" asChild>
                <a href={artist.portfolio} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </a>
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Work Samples</h4>
              <div className="flex gap-2">
                {artist.samples.map((sample, index) => (
                  <img
                    key={index}
                    src={sample}
                    alt={`Sample ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="default"
                onClick={() => handleApprove(artist.id, artist.name)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(artist.id, artist.name)}
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