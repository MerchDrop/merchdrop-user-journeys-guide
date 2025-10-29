import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Camera,
  Bell,
  Shield,
  Key,
  Trash2,
  Save
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NotificationSettings {
  email_orders: boolean;
  email_payouts: boolean;
  email_marketing: boolean;
  push_orders: boolean;
  push_payouts: boolean;
  push_marketing: boolean;
}

export default function UserProfileSettings() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [personalInfo, setPersonalInfo] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    website_url: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_orders: true,
    email_payouts: false,
    email_marketing: false,
    push_orders: true,
    push_payouts: false,
    push_marketing: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        display_name: profile.display_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: (profile as any).phone || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
      });

      // Load notification settings
      if ((profile as any).notification_settings) {
        setNotifications((profile as any).notification_settings as NotificationSettings);
      }
    }
  }, [profile]);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateProfile({
        display_name: personalInfo.display_name,
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        bio: personalInfo.bio,
        website_url: personalInfo.website_url,
      });

      // Update phone separately if needed
      if (personalInfo.phone) {
        await supabase
          .from('profiles')
          .update({ phone: personalInfo.phone } as any)
          .eq('id', user?.id);
      }
      
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your personal information has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        toast({
          title: "Password Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSubmit = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: notifications as any
        })
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update notification preferences",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been saved successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeactivation = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'suspended' })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You will be signed out.",
      });

      // Sign out after deactivation
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      await supabase.storage.from('avatars').remove([fileName]);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile in database using direct supabase call
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl } as any)
        .eq('id', user.id);
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully!",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {profile?.display_name?.[0] || profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor="user-avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" type="button" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="user-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={personalInfo.display_name}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          display_name: e.target.value
                        }))}
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Read-only)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={personalInfo.first_name}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          first_name: e.target.value
                        }))}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={personalInfo.last_name}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          last_name: e.target.value
                        }))}
                        placeholder="Last name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website_url">Website</Label>
                      <Input
                        id="website_url"
                        value={personalInfo.website_url}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          website_url: e.target.value
                        }))}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {personalInfo.bio.length}/500 characters
                  </p>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will deactivate your account. You will be signed out and won't be able to access your account until it's reactivated by an administrator.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAccountDeactivation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Deactivate Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
                    </div>
                    <Switch
                      checked={notifications.email_orders}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        email_orders: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                    </div>
                    <Switch
                      checked={notifications.email_marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        email_marketing: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-muted-foreground">Get push notifications for order updates</p>
                    </div>
                    <Switch
                      checked={notifications.push_orders}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        push_orders: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotional Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified about special offers and deals</p>
                    </div>
                    <Switch
                      checked={notifications.push_marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        push_marketing: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationsSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
