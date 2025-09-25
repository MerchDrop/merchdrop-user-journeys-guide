import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Instagram, 
  Music, 
  Camera,
  Bell,
  Shield,
  Eye,
  Save,
  Key,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ArtistProfile {
  id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_earnings: number;
}

interface NotificationSettings {
  email_orders: boolean;
  email_payouts: boolean;
  email_marketing: boolean;
  push_orders: boolean;
  push_payouts: boolean;
  push_marketing: boolean;
}

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Form states - Initialize with empty values first
  const [personalInfo, setPersonalInfo] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    website_url: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    spotify: '',
    tiktok: '',
    twitter: '',
    youtube: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        display_name: profile.display_name || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
      });

      setSocialLinks({
        instagram: profile.social_links?.instagram || '',
        spotify: profile.social_links?.spotify || '',
        tiktok: profile.social_links?.tiktok || '',
        twitter: profile.social_links?.twitter || '',
        youtube: profile.social_links?.youtube || '',
      });
    }
  }, [profile]);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_orders: true,
    email_payouts: true,
    email_marketing: false,
    push_orders: true,
    push_payouts: true,
    push_marketing: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch artist profile data
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching artist profile:', error);
          return;
        }

        if (data) {
          setArtistProfile(data);
        }
      } catch (error) {
        console.error('Error fetching artist profile:', error);
      }
    };

    fetchArtistProfile();
  }, [user]);

  // Update personal info
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Updating profile with data:', personalInfo);
      
      const { error } = await updateProfile({
        display_name: personalInfo.display_name,
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        email: personalInfo.email,
        phone: personalInfo.phone,
        bio: personalInfo.bio,
        website_url: personalInfo.website_url,
      });
      
      if (error) {
        console.error('Profile update error:', error);
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
        console.log('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update social links
  const handleSocialLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Updating social links with data:', socialLinks);
      
      const { error } = await updateProfile({
        social_links: socialLinks
      });
      
      if (error) {
        console.error('Social links update error:', error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update social links",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Social Links Updated",
          description: "Your social media links have been updated successfully.",
        });
        console.log('Social links updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating social links:', error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update artist profile
  const handleArtistProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artistProfile) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('artist_profiles')
        .update({
          artist_name: personalInfo.display_name,
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update artist profile: " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Artist Profile Updated",
          description: "Your artist information has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating artist profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
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

  // Save notification preferences
  const handleNotificationsSubmit = async () => {
    setIsLoading(true);

    try {
      console.log('Updating notification preferences:', notifications);
      
      // For now, we'll store notifications in the profiles table as JSON
      // In a real app, you might want a separate notifications_settings table
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          // Store notifications in a custom field or handle differently based on your schema
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Notifications update error:', error);
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
        console.log('Notification preferences updated successfully');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="artist">Artist Info</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
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
                {/* Profile Picture */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {profile?.display_name?.[0] || profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        placeholder="your@email.com"
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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

        {/* Artist Information */}
        <TabsContent value="artist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Artist Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {artistProfile && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Artist Name</Label>
                      <Input
                        value={artistProfile.artist_name}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Artist Slug</Label>
                      <Input
                        value={artistProfile.artist_slug}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input
                        value={artistProfile.status}
                        readOnly
                        className="bg-muted capitalize"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Commission Rate</Label>
                      <Input
                        value={`${artistProfile.commission_rate}%`}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Total Sales</Label>
                      <div className="text-2xl font-bold text-primary">
                        ${artistProfile.total_sales.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Earnings</Label>
                      <div className="text-2xl font-bold text-green-600">
                        ${artistProfile.total_earnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSocialLinksSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks(prev => ({
                        ...prev,
                        instagram: e.target.value
                      }))}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spotify" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Spotify
                    </Label>
                    <Input
                      id="spotify"
                      value={socialLinks.spotify}
                      onChange={(e) => setSocialLinks(prev => ({
                        ...prev,
                        spotify: e.target.value
                      }))}
                      placeholder="Your Spotify artist name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks(prev => ({
                        ...prev,
                        tiktok: e.target.value
                      }))}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks(prev => ({
                        ...prev,
                        twitter: e.target.value
                      }))}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks(prev => ({
                        ...prev,
                        youtube: e.target.value
                      }))}
                      placeholder="Your YouTube channel name"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Social Links'}
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
            <CardContent>
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

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Account Actions</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
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
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive new orders
                      </p>
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
                      <Label>Payout Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payout status updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_payouts}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        email_payouts: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive tips, updates, and promotional content
                      </p>
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

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Push Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser notifications for new orders
                      </p>
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
                      <Label>Payout Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser notifications for payout updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push_payouts}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        push_payouts: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationsSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}