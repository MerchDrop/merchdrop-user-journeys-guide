import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useArtists } from '@/hooks/useArtistsQuery';
import { useCurrency } from '@/context/CurrencyContext';

export function ArtistOverview() {
  const { artists, loading } = useArtists();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalArtists = artists.length;
  const pendingArtists = artists.filter(a => a.status === 'pending').length;
  const approvedArtists = artists.filter(a => a.status === 'approved').length;
  const rejectedArtists = artists.filter(a => a.status === 'rejected').length;
  const totalSales = artists.reduce((sum, artist) => sum + artist.total_sales, 0);
  const totalEarnings = artists.reduce((sum, artist) => sum + artist.total_earnings, 0);

  const { formatPrice } = useCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalArtists}</div>
          <p className="text-xs text-muted-foreground">
            All registered artists
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingArtists}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Artists</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedArtists}</div>
          <p className="text-xs text-muted-foreground">
            Active on platform
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
          <p className="text-xs text-muted-foreground">
            Artist revenue generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ArtistOverview;