import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data
const keyMetrics = [
  {
    title: 'Total Users',
    value: '12,483',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Active Artists',
    value: '2,156',
    change: '+8.3%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Total Products',
    value: '8,947',
    change: '+23.1%',
    changeType: 'positive',
    icon: ShoppingBag,
  },
  {
    title: 'Monthly Revenue',
    value: '$45,231',
    change: '+15.7%',
    changeType: 'positive',
    icon: DollarSign,
  },
];

const recentActivity = [
  {
    type: 'user_signup',
    message: 'New user registered: john.doe@email.com',
    time: '2 minutes ago',
    icon: Users,
  },
  {
    type: 'product_created',
    message: 'New product created by Maya Rodriguez',
    time: '15 minutes ago',
    icon: ShoppingBag,
  },
  {
    type: 'order_placed',
    message: 'Order #12345 placed - $89.99',
    time: '1 hour ago',
    icon: DollarSign,
  },
  {
    type: 'artist_approved',
    message: 'Artist application approved: Alex Chen',
    time: '2 hours ago',
    icon: CheckCircle,
  },
];

const dailyActiveUsers = [
  { date: '1', users: 1200 },
  { date: '2', users: 1350 },
  { date: '3', users: 1180 },
  { date: '4', users: 1420 },
  { date: '5', users: 1650 },
  { date: '6', users: 1480 },
  { date: '7', users: 1720 },
];

const userTypes = [
  { name: 'Regular Users', value: 8500, color: 'hsl(var(--primary))' },
  { name: 'Artists', value: 2200, color: 'hsl(var(--secondary))' },
  { name: 'Admins', value: 50, color: 'hsl(var(--accent))' },
];

const pendingActions = [
  {
    title: 'Artist Applications',
    count: 12,
    priority: 'high',
    action: 'Review',
  },
  {
    title: 'Product Reviews',
    count: 8,
    priority: 'medium',
    action: 'Moderate',
  },
  {
    title: 'Support Tickets',
    count: 23,
    priority: 'high',
    action: 'Respond',
  },
  {
    title: 'Payout Requests',
    count: 15,
    priority: 'medium',
    action: 'Process',
  },
];

const AdminOverview = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-500 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.changeType === 'positive';
          
          return (
            <Card key={index} className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Active Users Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypes.map((entry, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.title}</span>
                      <Badge 
                        variant="outline"
                        className={getPriorityColor(action.priority)}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.count} items pending
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {action.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Server Performance</span>
                <span className="text-sm text-green-500">Excellent</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Health</span>
                <span className="text-sm text-green-500">Good</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-orange-500">Moderate</span>
              </div>
              <Progress value={73} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;