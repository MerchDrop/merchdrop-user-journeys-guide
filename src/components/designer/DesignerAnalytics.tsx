import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesigners } from '@/hooks/useDesignersQuery';
import { useCurrency } from '@/context/CurrencyContext';
import { FileImage, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const DesignerAnalytics = () => {
  const { designerProfile, designs, payouts, loading } = useDesigners();
  const { formatPrice } = useCurrency();

  // Uploads, approvals, and earnings per month for the last 6 months
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthDesigns = designs.filter(d => {
        const created = new Date(d.created_at);
        return created.getMonth() === month && created.getFullYear() === year;
      });
      const monthApproved = monthDesigns.filter(d => d.status === 'approved').length;
      const monthEarnings = payouts
        .filter(p => {
          const created = new Date(p.created_at);
          return created.getMonth() === month && created.getFullYear() === year;
        })
        .reduce((sum, p) => sum + p.net_amount, 0);

      result.push({
        month: monthNames[month],
        uploads: monthDesigns.length,
        approved: monthApproved,
        earnings: monthEarnings,
      });
    }
    return result;
  }, [designs, payouts]);

  const statusData = [
    { name: 'Approved', value: designerProfile?.approved_designs || 0, color: '#22c55e' },
    { name: 'Pending', value: designerProfile?.pending_designs || 0, color: '#eab308' },
    { name: 'Declined', value: designerProfile?.declined_designs || 0, color: '#ef4444' },
  ];

  const recentDesigns = designs.slice(0, 5);
  const totalEarnings = payouts.reduce((sum, p) => sum + p.net_amount, 0);
  const approvalRate = designerProfile?.total_designs ?
    ((designerProfile.approved_designs / designerProfile.total_designs) * 100).toFixed(1) : '0';

  const avgApprovalDays = useMemo(() => {
    const approved = designs.filter(d => d.status === 'approved' && d.approved_at);
    if (approved.length === 0) return null;
    const totalDays = approved.reduce((sum, d) => {
      const created = new Date(d.created_at).getTime();
      const approvedAt = new Date(d.approved_at!).getTime();
      return sum + (approvedAt - created) / (1000 * 60 * 60 * 24);
    }, 0);
    return totalDays / approved.length;
  }, [designs]);

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
                <p className="text-sm text-muted-foreground">
                  {monthlyData[monthlyData.length - 1]?.uploads || 0} this month
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {designerProfile?.approved_designs || 0} of {designerProfile?.total_designs || 0} designs
                </p>
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
                <p className="text-3xl font-bold">{formatPrice(totalEarnings)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(monthlyData[monthlyData.length - 1]?.earnings || 0)} this month
                </p>
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
                <p className="text-3xl font-bold">{avgApprovalDays !== null ? avgApprovalDays.toFixed(1) : 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {avgApprovalDays !== null ? 'days' : 'no approvals yet'}
                </p>
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
                <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Earnings']} />
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
                        +{formatPrice(design.revenue_generated)}
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
            <CardTitle>This Month</CardTitle>
            <CardDescription>Your activity over the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploads</span>
                <span className="font-medium">{monthlyData[monthlyData.length - 1]?.uploads || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium">{monthlyData[monthlyData.length - 1]?.approved || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-medium">{formatPrice(monthlyData[monthlyData.length - 1]?.earnings || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};