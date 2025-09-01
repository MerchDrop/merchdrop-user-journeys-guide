import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, UserCheck, UserX, ExternalLink, Loader2 } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useCurrency } from '@/context/CurrencyContext';

export function AdminArtistTable() {
  const { artists, loading, approveArtist, rejectArtist } = useArtists();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default' as const;
      case 'pending':
        return 'secondary' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const { formatPrice } = useCurrency();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (artistId: string, newStatus: string) => {
    if (newStatus === 'approved') {
      await approveArtist(artistId);
    } else if (newStatus === 'rejected') {
      await rejectArtist(artistId);
    }
  };

  const filteredArtists = statusFilter === 'all' 
    ? artists 
    : artists.filter(artist => artist.status === statusFilter);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading artists...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Artists ({filteredArtists.length})</CardTitle>
            <CardDescription>
              Manage all artist accounts and their status across the platform.
            </CardDescription>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {statusFilter === 'all' 
                    ? 'No artists found.' 
                    : `No artists with ${statusFilter} status.`
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredArtists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={artist.avatar_url || '/placeholder.svg'} alt={artist.artist_name} />
                        <AvatarFallback>
                          {artist.artist_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{artist.artist_name}</div>
                        {artist.display_name && artist.display_name !== artist.artist_name && (
                          <div className="text-sm text-muted-foreground">{artist.display_name}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{artist.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(artist.status)} className="capitalize">
                      {artist.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{artist.commission_rate}%</TableCell>
                  <TableCell>{formatPrice(artist.total_sales)}</TableCell>
                  <TableCell>{formatPrice(artist.total_earnings)}</TableCell>
                  <TableCell>{formatDate(artist.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {artist.website_url && (
                          <DropdownMenuItem asChild>
                            <a href={artist.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Portfolio
                            </a>
                          </DropdownMenuItem>
                        )}
                        {artist.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(artist.id, 'approved')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(artist.id, 'rejected')}>
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {artist.status === 'rejected' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(artist.id, 'approved')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminArtistTable;