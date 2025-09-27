import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesigners } from '@/hooks/useDesigners';
import { FileImage, Calendar, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

export const MyDesigns = () => {
  const { designs, loading } = useDesigners();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDesigns = designs.filter(design => {
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter;
    const matchesSearch = design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.artist_profiles?.artist_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">My Designs</h1>
          <p className="text-muted-foreground">Manage and track your design submissions</p>
        </div>
        <Button asChild>
          <a href="/designer/upload">Upload New Design</a>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search designs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileImage className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{designs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{designs.filter(d => d.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-600"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{designs.filter(d => d.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-600"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-bold">{designs.filter(d => d.status === 'declined').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designs List */}
      <div className="space-y-4">
        {filteredDesigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No designs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Upload your first design to get started!'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <a href="/designer/upload">Upload Design</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDesigns.map((design) => (
            <Card key={design.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{design.title}</h3>
                      <Badge className={getStatusColor(design.status)}>
                        {design.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      For: <span className="font-medium">{design.artist_profiles?.artist_name}</span>
                    </p>
                    
                    {design.description && (
                      <p className="text-sm text-muted-foreground mb-4">{design.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(design.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileImage className="h-4 w-4" />
                        {design.file_urls.length} file{design.file_urls.length !== 1 ? 's' : ''}
                      </div>
                      {design.revenue_generated > 0 && (
                        <div className="text-green-600 font-medium">
                          ${design.revenue_generated.toFixed(2)} earned
                        </div>
                      )}
                    </div>
                    
                    {design.status === 'declined' && design.admin_feedback && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Admin Feedback:</strong> {design.admin_feedback}
                        </p>
                      </div>
                    )}
                    
                    {design.status === 'approved' && design.approved_at && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>Approved:</strong> {format(new Date(design.approved_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};