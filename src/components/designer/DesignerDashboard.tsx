import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDesigners } from '@/hooks/useDesignersQuery';
import { FileImage, Users, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DesignerDashboard = () => {
  const { designerProfile, designs, payouts, loading } = useDesigners();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!designerProfile) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Designer Portal</CardTitle>
            <CardDescription>
              You need to create a designer profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/designer/profile">
              <Button>Create Designer Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingDesigns = designs.filter(d => d.status === 'pending');
  const approvedDesigns = designs.filter(d => d.status === 'approved');
  const declinedDesigns = designs.filter(d => d.status === 'declined');
  const totalEarnings = payouts.reduce((sum, p) => sum + p.net_amount, 0);

  const stats = [
    {
      title: "Total Designs",
      value: designerProfile.total_designs,
      icon: FileImage,
      color: "text-blue-600"
    },
    {
      title: "Approved",
      value: designerProfile.approved_designs,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Pending",
      value: designerProfile.pending_designs,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {designerProfile.designer_name}!</h1>
          <p className="text-muted-foreground">Here's your design portfolio overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/designer/upload">
            <Button>Upload Design</Button>
          </Link>
          <Link to="/designer/artists">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Browse Artists
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your designer activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/designer/designs">
              <Button>
                <FileImage className="h-4 w-4 mr-2" />
                View My Designs
              </Button>
            </Link>
            <Link to="/designer/payouts">
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payouts
              </Button>
            </Link>
            <Link to="/designer/analytics">
              <Button variant="outline">
                <FileImage className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to="/designer/settings">
              <Button variant="outline">
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Designs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Designs</CardTitle>
            <CardDescription>Your latest design submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {designs.slice(0, 5).map((design) => (
                <div key={design.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{design.title}</p>
                    <p className="text-sm text-muted-foreground">
                      For: {design.artist_profiles?.artist_name}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      design.status === 'approved' ? 'default' : 
                      design.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {design.status}
                  </Badge>
                </div>
              ))}
              {designs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No designs uploaded yet
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/designer/designs">
                <Button variant="outline" className="w-full">View All Designs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payouts.slice(0, 5).map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">${payout.net_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      payout.status === 'completed' ? 'default' : 
                      payout.status === 'processing' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {payout.status}
                  </Badge>
                </div>
              ))}
              {payouts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No payouts yet
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/designer/payouts">
                <Button variant="outline" className="w-full">View All Payouts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};