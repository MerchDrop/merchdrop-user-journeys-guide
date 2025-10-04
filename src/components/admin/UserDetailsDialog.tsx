import React, { useState } from 'react';
import { UserProfile } from '@/hooks/useUsersQuery';
import { useUserDetails } from '@/hooks/useUserDetails';
import { useUsers } from '@/hooks/useUsers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Palette, 
  Briefcase,
  Key,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const { userDetails, isLoading, resetPassword, deleteUser, verifyEmail, isResettingPassword, isDeletingUser, isVerifyingEmail } = useUserDetails(user?.id || null);
  const { activateUser, suspendUser } = useUsers();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!user) return null;

  const handleResetPassword = async () => {
    if (user.email) {
      await resetPassword(user.email);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteConfirmText === 'DELETE') {
      await deleteUser();
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    }
  };

  const handleActivateUser = async () => {
    await activateUser(user.id);
  };

  const handleSuspendUser = async () => {
    await suspendUser(user.id);
  };

  const handleVerifyEmail = async () => {
    await verifyEmail();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'artist': return 'secondary';
      case 'designer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.display_name?.[0] || user.email[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{user.display_name || 'No Name'}</DialogTitle>
                <DialogDescription>{user.email}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="extras">Profiles</TabsTrigger>
              <TabsTrigger value="admin">Admin Actions</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Display Name
                    </Label>
                    <p className="text-sm">{userDetails?.profile?.display_name || 'Not set'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm">{userDetails?.profile?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name
                    </Label>
                    <p className="text-sm">{userDetails?.profile?.first_name || 'Not set'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Last Name
                    </Label>
                    <p className="text-sm">{userDetails?.profile?.last_name || 'Not set'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="text-sm">{userDetails?.profile?.phone || 'Not set'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="text-sm">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {userDetails?.profile?.bio && (
                    <div className="col-span-2 space-y-2">
                      <Label>Bio</Label>
                      <p className="text-sm">{userDetails.profile.bio}</p>
                    </div>
                  )}

                  {userDetails?.profile?.website_url && (
                    <div className="col-span-2 space-y-2">
                      <Label>Website</Label>
                      <a href={userDetails.profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {userDetails.profile.website_url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Roles
                </Label>
                <div className="flex flex-wrap gap-2">
                  {user.user_roles.map((roleDetail) => (
                    <div key={roleDetail.id} className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(roleDetail.role)}>
                        {roleDetail.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(roleDetail.status)}>
                        {roleDetail.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Role History</Label>
                {user.user_roles.map((roleDetail) => (
                  <div key={roleDetail.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(roleDetail.role)}>
                          {roleDetail.role}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(roleDetail.status)}>
                          {roleDetail.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(roleDetail.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {roleDetail.approved_at && (
                      <p className="text-xs text-muted-foreground">
                        Approved on {format(new Date(roleDetail.approved_at), 'MMM dd, yyyy')}
                      </p>
                    )}

                    {roleDetail.rejection_reason && (
                      <p className="text-xs text-destructive">
                        Rejection Reason: {roleDetail.rejection_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Extras Tab - Artist/Designer Profiles */}
            <TabsContent value="extras" className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  {userDetails?.artistProfile && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Artist Profile</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Artist Name</Label>
                          <p className="text-sm">{userDetails.artistProfile.artist_name}</p>
                        </div>
                        <div>
                          <Label>Slug</Label>
                          <p className="text-sm">{userDetails.artistProfile.artist_slug}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge variant={getStatusBadgeVariant(userDetails.artistProfile.status)}>
                            {userDetails.artistProfile.status}
                          </Badge>
                        </div>
                        <div>
                          <Label>Commission Rate</Label>
                          <p className="text-sm">{userDetails.artistProfile.commission_rate}%</p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Sales
                          </Label>
                          <p className="text-sm">${userDetails.artistProfile.total_sales || 0}</p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Earnings
                          </Label>
                          <p className="text-sm">${userDetails.artistProfile.total_earnings || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userDetails?.designerProfile && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Designer Profile</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Designer Name</Label>
                          <p className="text-sm">{userDetails.designerProfile.designer_name}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge variant={getStatusBadgeVariant(userDetails.designerProfile.status)}>
                            {userDetails.designerProfile.status}
                          </Badge>
                        </div>
                        <div>
                          <Label>Total Designs</Label>
                          <p className="text-sm">{userDetails.designerProfile.total_designs}</p>
                        </div>
                        <div>
                          <Label>Approved Designs</Label>
                          <p className="text-sm">{userDetails.designerProfile.approved_designs}</p>
                        </div>
                        <div>
                          <Label>Pending Designs</Label>
                          <p className="text-sm">{userDetails.designerProfile.pending_designs}</p>
                        </div>
                        <div>
                          <Label>Declined Designs</Label>
                          <p className="text-sm">{userDetails.designerProfile.declined_designs}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Earnings
                          </Label>
                          <p className="text-sm">${userDetails.designerProfile.total_earnings || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!userDetails?.artistProfile && !userDetails?.designerProfile && (
                    <p className="text-center text-muted-foreground py-8">
                      No artist or designer profiles found
                    </p>
                  )}
                </>
              )}
            </TabsContent>

            {/* Admin Actions Tab */}
            <TabsContent value="admin" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleResetPassword} 
                  variant="outline"
                  disabled={isResettingPassword}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  {isResettingPassword ? 'Sending...' : 'Reset Password'}
                </Button>

                <Button 
                  onClick={handleVerifyEmail} 
                  variant="outline"
                  disabled={isVerifyingEmail}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
                </Button>

                <Button 
                  onClick={handleActivateUser} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Activate Account
                </Button>

                <Button 
                  onClick={handleSuspendUser} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Suspend Account
                </Button>

                <Button 
                  onClick={() => setDeleteConfirmOpen(true)} 
                  variant="destructive"
                  className="col-span-2 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User Account
                </Button>
              </div>

              <div className="border border-destructive/50 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      These actions are irreversible. Please be certain before proceeding.
                    </p>
                  </div>
                </div>
              </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label>Type "DELETE" to confirm</Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteConfirmText !== 'DELETE' || isDeletingUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingUser ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
