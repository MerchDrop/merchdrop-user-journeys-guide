import React from 'react';
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
import { MoreHorizontal, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

export function CleanAdminUserTable() {
  const { users, loading, updateUserRole, suspendUser, activateUser } = useUsers();
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive' as const;
      case 'artist':
        return 'default' as const;
      case 'moderator':
        return 'secondary' as const;
      default:
        return 'outline' as const;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts and their roles across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found. Users will appear here when they sign up.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const primaryRole = user.user_roles?.[0]?.role || 'user';
                const userStatus = 'active'; // Default status since we don't have status field yet
                
                return (
                  <TableRow key={user.id}>
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
                      <Badge variant={getRoleBadgeVariant(primaryRole)}>
                        {primaryRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(userStatus)}>
                        {userStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'artist')}>
                            Make Artist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'user')}>
                            Make User
                          </DropdownMenuItem>
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
  );
}
