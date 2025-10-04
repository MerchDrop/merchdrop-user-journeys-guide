import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UserDetailsDialog } from './UserDetailsDialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, UserCheck, UserX, Loader2, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useUsers } from '@/hooks/useUsersQuery';
import { useRoleApproval } from '@/hooks/useRoleApproval';
import { UserProfile } from '@/hooks/useUsersQuery';

export function CleanAdminUserTable() {
  const { users, loading, updateUserRole, suspendUser, activateUser } = useUsers();
  const { approveRole, rejectRole, loading: approvalLoading } = useRoleApproval();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; role: 'admin' | 'artist' | 'designer' | 'moderator' | 'user' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserProfile | null>(null);

  const handleApprove = async (userId: string, role: 'admin' | 'artist' | 'designer' | 'moderator' | 'user') => {
    try {
      await approveRole(userId, role);
    } catch (error) {
      console.error('Error approving role:', error);
    }
  };

  const handleRejectClick = (userId: string, role: 'admin' | 'artist' | 'designer' | 'moderator' | 'user') => {
    setSelectedUser({ id: userId, role });
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await rejectRole(selectedUser.id, selectedUser.role, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting role:', error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'artist':
        return 'secondary';
      case 'designer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default' as const;
      case 'suspended':
        return 'destructive' as const;
      case 'pending':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const filteredUsers = users?.filter(user => {
    if (statusFilter === 'all') return true;
    
    const hasRole = user.user_roles?.some((ur: any) => {
      if (statusFilter === 'pending') return ur.status === 'pending';
      if (statusFilter === 'active') return ur.status === 'active';
      if (statusFilter === 'rejected') return ur.status === 'rejected';
      return true;
    });
    
    return hasRole;
  }) || [];

  const pendingCount = users?.filter(u => 
    u.user_roles?.some((ur: any) => ur.status === 'pending')
  ).length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            {pendingCount > 0 && (
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                {pendingCount} Pending Approval
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and approve pending role requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles & Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const userRoles = user.user_roles || [];
                  const pendingRoles = userRoles.filter((ur: any) => ur.status === 'pending');
                  const activeRoles = userRoles.filter((ur: any) => ur.status === 'active');
                  
                  return (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedUserForDetails(user);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} alt={user.display_name || user.email} />
                            <AvatarFallback>
                              {user.display_name?.charAt(0)?.toUpperCase() || 
                               user.first_name?.charAt(0)?.toUpperCase() ||
                               user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">
                              {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {/* Account Status Badge */}
                          {user.account_status && (
                            <Badge variant={getStatusBadgeVariant(user.account_status)} className="w-fit">
                              {user.account_status}
                            </Badge>
                          )}
                          {activeRoles.map((ur: any) => (
                            <div key={ur.id} className="flex items-center gap-2">
                              <Badge variant={getRoleBadgeVariant(ur.role)}>
                                {ur.role}
                              </Badge>
                              <Badge variant={getRoleStatusBadgeVariant(ur.status)} className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                active
                              </Badge>
                            </div>
                          ))}
                          {pendingRoles.map((ur: any) => (
                            <div key={ur.id} className="flex items-center gap-2">
                              <Badge variant={getRoleBadgeVariant(ur.role)}>
                                {ur.role}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                pending
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForDetails(user);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="h-px p-0 bg-border" disabled />
                            {pendingRoles.length > 0 && (
                              <>
                                {pendingRoles.map((ur: any) => (
                                  <React.Fragment key={ur.id}>
                                    <DropdownMenuItem 
                                      onClick={() => handleApprove(user.id, ur.role)}
                                      disabled={approvalLoading}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                      Approve {ur.role}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleRejectClick(user.id, ur.role)}
                                      disabled={approvalLoading}
                                    >
                                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                      Reject {ur.role}
                                    </DropdownMenuItem>
                                  </React.Fragment>
                                ))}
                                <DropdownMenuItem className="h-px p-0 bg-border" disabled />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'artist')}>
                              Make Artist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'designer')}>
                              Make Designer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'user')}>
                              Make User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="h-px p-0 bg-border" disabled />
                            <DropdownMenuItem onClick={() => activateUser(user.id)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => suspendUser(user.id)}>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Role Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this {selectedUser?.role} role request? 
              You can optionally provide a reason below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectConfirm} disabled={approvalLoading}>
              {approvalLoading ? 'Rejecting...' : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUserForDetails}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
}
