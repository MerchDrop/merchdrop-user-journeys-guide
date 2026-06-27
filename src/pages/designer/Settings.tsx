import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, CreditCard, Shield, User, Key, Trash2, Download } from 'lucide-react';
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
  email_design_approvals: boolean;
  email_payouts: boolean;
  push_design_approvals: boolean;
  push_payouts: boolean;
}

export default function DesignerSettings() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_design_approvals: true,
    email_payouts: true,
    push_design_approvals: true,
    push_payouts: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Load notification settings
  useEffect(() => {
    if ((profile as any)?.notification_settings) {
      const settings = (profile as any).notification_settings as any;
      setNotifications({
        email_design_approvals: settings.email_design_approvals ?? true,
        email_payouts: settings.email_payouts ?? true,
        push_design_approvals: settings.push_design_approvals ?? true,
        push_payouts: settings.push_payouts ?? true,
      });
    }
  }, [profile]);

  const handleNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: updatedNotifications as any })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setIsLoading(true);
    try {
      // Fetch all user data
      const { data: designerProfile } = await supabase
        .from('designer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const { data: designs } = await supabase
        .from('designs')
        .select('*')
        .eq('designer_id', designerProfile?.id);

      const userData = {
        profile,
        designerProfile,
        designs,
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `designer-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Downloaded",
        description: "Your data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
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

      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email - Design Approvals</p>
                <p className="text-sm text-muted-foreground">Get notified when your designs are approved or declined</p>
              </div>
              <Switch
                checked={notifications.email_design_approvals}
                onCheckedChange={(checked) => handleNotificationToggle('email_design_approvals', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email - Payout Updates</p>
                <p className="text-sm text-muted-foreground">Receive updates on payout processing</p>
              </div>
              <Switch
                checked={notifications.email_payouts}
                onCheckedChange={(checked) => handleNotificationToggle('email_payouts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push - Design Approvals</p>
                <p className="text-sm text-muted-foreground">Get push notifications for design updates</p>
              </div>
              <Switch
                checked={notifications.push_design_approvals}
                onCheckedChange={(checked) => handleNotificationToggle('push_design_approvals', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push - Payout Updates</p>
                <p className="text-sm text-muted-foreground">Get push notifications for payouts</p>
              </div>
              <Switch
                checked={notifications.push_payouts}
                onCheckedChange={(checked) => handleNotificationToggle('push_payouts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Manage your payout preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Payment Method</p>
              <Button variant="outline" className="w-full justify-start">
                Add Payment Method
              </Button>
            </div>
            <div>
              <p className="font-medium mb-2">Payout Schedule</p>
              <p className="text-sm text-muted-foreground">Monthly payouts on the 15th</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={isLoading}>
                <Key className="h-4 w-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Account management options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleDownloadData}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download My Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will deactivate your designer account. You will be signed out and won't be able to access your account until it's reactivated by an administrator.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccountDeactivation}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Deactivate Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}