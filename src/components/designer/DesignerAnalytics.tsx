import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesigners } from '@/hooks/useDesigners';
import { TrendingUp, FileImage, CheckCircle, DollarSign, Calendar, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const DesignerAnalytics = () => {
  const { designerProfile, designs, payouts, loading } = useDesigners();

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', uploads: 2, approved: 1, earnings: 45 },
    { month: 'Feb', uploads: 4, approved: 3, earnings: 120 },
    { month: 'Mar', uploads: 3, approved: 2, earnings: 85 },
    { month: 'Apr', uploads: 6, approved: 4, earnings: 200 },
    { month: 'May', uploads: 5, approved: 4, earnings: 180 },
    { month: 'Jun', uploads: 7, approved: 5, earnings: 250 },
  ];

  const statusData = [
    { name: 'Approved', value: designerProfile?.approved_designs || 0, color: '#22c55e' },
    { name: 'Pending', value: designerProfile?.pending_designs || 0, color: '#eab308' },
    { name: 'Declined', value: designerProfile?.declined_designs || 0, color: '#ef4444' },
  ];

  const recentDesigns = designs.slice(0, 5);
  const totalEarnings = payouts.reduce((sum, p) => sum + p.net_amount, 0);
  const approvalRate = designerProfile?.total_designs ? 
    ((designerProfile.approved_designs / designerProfile.total_designs) * 100).toFixed(1) : '0';

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your design performance and earnings</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Designs</p>
                <p className="text-3xl font-bold">{designerProfile?.total_designs || 0}</p>
                <p className="text-sm text-green-600">+2 this month</p>
              </div>
              <FileImage className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold">{approvalRate}%</p>
                <p className="text-sm text-green-600">+5% vs last month</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-green-600">+$50 this month</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Approval</p>
                <p className="text-3xl font-bold">3.2</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
              <Calendar className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Your uploads, approvals, and earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uploads" stroke="#3b82f6" name="Uploads" />
                  <Line type="monotone" dataKey="approved" stroke="#22c55e" name="Approved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Design Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Design Status Distribution</CardTitle>
            <CardDescription>Breakdown of your design submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
          <CardDescription>Your earnings progression over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                <Bar dataKey="earnings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Designs</CardTitle>
            <CardDescription>Your latest design submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDesigns.map((design) => (
                <div key={design.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{design.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {design.artist_profiles?.artist_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs ${
                      design.status === 'approved' ? 'bg-green-100 text-green-800' :
                      design.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {design.status}
                    </div>
                    {design.revenue_generated > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        +${design.revenue_generated.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Goals</CardTitle>
            <CardDescription>Your progress towards monthly targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Uploads</span>
                  <span>7/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Approval Rate</span>
                  <span>{approvalRate}/80%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(parseFloat(approvalRate), 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Earnings</span>
                  <span>${totalEarnings.toFixed(2)}/$300</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((totalEarnings / 300) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};