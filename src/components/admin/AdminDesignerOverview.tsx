import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  Palette,
  MoreVertical,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesignerStats {
  totalDesigners: number;
  pendingApproval: number;
  approvedDesigners: number;
  totalSales: number;
  pendingApplications: any[];
  allDesigners: any[];
}

export function AdminDesignerOverview() {
  const [stats, setStats] = useState<DesignerStats>({
    totalDesigners: 0,
    pendingApproval: 0,
    approvedDesigners: 0,
    totalSales: 0,
    pendingApplications: [],
    allDesigners: []
  });
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const fetchDesignerStats = async () => {
    try {
      setLoading(true);

      // Fetch all designer profiles
      const { data: designers } = await supabase
        .from('designer_profiles')
        .select(`
          *,
          profiles(display_name, email)
        `)
        .order('created_at', { ascending: false });

      // Fetch designer roles to check status
      const { data: designerRoles } = await supabase
        .from('user_roles')
        .select('user_id, status')
        .eq('role', 'designer');

      // Combine data
      const designersWithStatus = designers?.map(designer => {
        const role = designerRoles?.find(r => r.user_id === designer.user_id);
        return {
          ...designer,
          role_status: role?.status || 'active'
        };
      }) || [];

      const totalDesigners = designers?.length || 0;
      const pendingApproval = designersWithStatus.filter(d => d.role_status === 'pending' || d.status === 'pending').length;
      const approvedDesigners = designersWithStatus.filter(d => d.status === 'active').length;
      const totalSales = designers?.reduce((sum, d) => sum + (d.total_earnings || 0), 0) || 0;
      const pendingApplications = designersWithStatus.filter(d => d.role_status === 'pending' || d.status === 'pending');

      setStats({
        totalDesigners,
        pendingApproval,
        approvedDesigners,
        totalSales,
        pendingApplications,
        allDesigners: designersWithStatus
      });
    } catch (error) {
      console.error('Error fetching designer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignerStats();
  }, []);

  const handleApproveDesigner = async (designerId: string, userId: string) => {
    try {
      // Get designer info
      const { data: designerProfile } = await supabase
        .from('designer_profiles')
        .select('designer_name')
        .eq('id', designerId)
        .single();

      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      // Update designer profile status
      await supabase
        .from('designer_profiles')
        .update({ status: 'active' })
        .eq('id', designerId);

      // Update user role status
      await supabase
        .from('user_roles')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .eq('role', 'designer');

      // Send approval email
      if (profile?.email && designerProfile?.designer_name) {
        await supabase.functions.invoke('send-designer-approval-email', {
          body: {
            email: profile.email,
            displayName: designerProfile.designer_name,
            status: 'approved'
          }
        });
      }

      toast.success('Designer approved successfully', {
        description: 'An approval email has been sent to the designer.'
      });

      fetchDesignerStats();
    } catch (error) {
      console.error('Error approving designer:', error);
      toast.error('Failed to approve designer', {
        description: 'Please try again later.'
      });
    }
  };

  const handleRejectDesigner = async (designerId: string, userId: string, reason?: string) => {
    try {
      // Get designer info
      const { data: designerProfile } = await supabase
        .from('designer_profiles')
        .select('designer_name')
        .eq('id', designerId)
        .single();

      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      // Update designer profile status
      await supabase
        .from('designer_profiles')
        .update({ status: 'inactive' })
        .eq('id', designerId);

      // Update user role status
      await supabase
        .from('user_roles')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('user_id', userId)
        .eq('role', 'designer');

      // Send rejection email
      if (profile?.email && designerProfile?.designer_name) {
        await supabase.functions.invoke('send-designer-approval-email', {
          body: {
            email: profile.email,
            displayName: designerProfile.designer_name,
            status: 'rejected',
            reason
          }
        });
      }

      toast.success('Designer application rejected', {
        description: 'A notification email has been sent to the designer.'
      });

      fetchDesignerStats();
    } catch (error) {
      console.error('Error rejecting designer:', error);
      toast.error('Failed to reject designer', {
        description: 'Please try again later.'
      });
    }
  };

  const kpiCards = [
    {
      title: 'Total Designers',
      value: stats.totalDesigners.toString(),
      description: 'All registered designers on the platform',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingApproval.toString(),
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Approved Designers',
      value: stats.approvedDesigners.toString(),
      description: 'Currently active on the platform',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Sales',
      value: formatPrice(stats.totalSales),
      description: 'Total designer revenue generated',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Designer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage designer profiles, approvals, and performance
          </p>
        </div>
        <Button onClick={fetchDesignerStats} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-12 w-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending Designer Applications */}
      {stats.pendingApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Designer Applications ({stats.pendingApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Designer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Designs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pendingApplications.map((designer) => (
                    <TableRow key={designer.id}>
                      <TableCell className="font-medium">{designer.designer_name}</TableCell>
                      <TableCell>{designer.profiles?.email}</TableCell>
                      <TableCell>{new Date(designer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{designer.total_designs || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveDesigner(designer.id, designer.user_id)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectDesigner(designer.id, designer.user_id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Designers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              All Designers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Designs</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.allDesigners.map((designer) => (
                  <TableRow key={designer.id}>
                    <TableCell className="font-medium">{designer.designer_name}</TableCell>
                    <TableCell>{designer.profiles?.email}</TableCell>
                    <TableCell>
                      <Badge variant={designer.status === 'active' ? 'default' : 'secondary'}>
                        {designer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{designer.total_designs || 0}</TableCell>
                    <TableCell>{designer.approved_designs || 0}</TableCell>
                    <TableCell>{designer.pending_designs || 0}</TableCell>
                    <TableCell>{formatPrice(designer.total_earnings || 0)}</TableCell>
                    <TableCell>{new Date(designer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          {designer.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApproveDesigner(designer.id, designer.user_id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectDesigner(designer.id, designer.user_id)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
