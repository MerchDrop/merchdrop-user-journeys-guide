import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Instagram, Twitter, Youtube, Globe, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: React.ComponentType<any>;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

export default function ProfileSettings() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    email: '',
    phone: '',
    avatar_url: '',
    website_url: '',
    social_links: {},
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'instagram', url: '' });

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        website_url: profile.website_url || '',
        social_links: profile.social_links || {},
      });

      // Convert social_links object to array format
      if (profile.social_links) {
        const linksArray = Object.entries(profile.social_links).map(([platform, url]) => ({
          id: platform,
          platform,
          url: url as string,
          icon: platformIcons[platform as keyof typeof platformIcons] || Globe,
        }));
        setSocialLinks(linksArray);
      }
    }
  }, [profile]);

  const handleProfileUpdate = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Convert social links array back to object format
      const socialLinksObject = socialLinks.reduce((acc, link) => {
        acc[link.platform] = link.url;
        return acc;
      }, {} as Record<string, string>);

      const updates = {
        display_name: profileData.display_name,
        bio: profileData.bio,
        phone: profileData.phone,
        website_url: profileData.website_url,
        social_links: socialLinksObject,
        ...(profileData.avatar_url && profileData.avatar_url !== profile?.avatar_url && {
          avatar_url: profileData.avatar_url
        })
      };

      const { error } = await updateProfile(updates);
      
      if (!error) {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = () => {
    if (newSocialLink.url && !socialLinks.find(link => link.platform === newSocialLink.platform)) {
      const newLink: SocialLink = {
        id: newSocialLink.platform,
        platform: newSocialLink.platform,
        url: newSocialLink.url,
        icon: platformIcons[newSocialLink.platform as keyof typeof platformIcons] || Globe,
      };
      setSocialLinks(prev => [...prev, newLink]);
      setNewSocialLink({ platform: 'instagram', url: '' });
    }
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Delete old avatar if exists
      await supabase.storage.from('avatars').remove([fileName]);
      
      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      handleProfileUpdate('avatar_url', data.publicUrl);
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully. Don't forget to save your changes.",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your artist profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {/* Profile Picture */}
               <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                   <AvatarImage src={profileData.avatar_url || '/placeholder.svg'} />
                   <AvatarFallback>
                     {profileData.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                   </AvatarFallback>
                 </Avatar>
                 <div>
                   <Label htmlFor="avatar-upload">
                     <Button variant="outline" className="mb-2 cursor-pointer" asChild>
                       <span>
                         <Camera className="h-4 w-4 mr-2" />
                         Change Photo
                       </span>
                     </Button>
                   </Label>
                   <Input
                     id="avatar-upload"
                     type="file"
                     accept="image/*"
                     onChange={handleAvatarUpload}
                     className="hidden"
                   />
                   <p className="text-sm text-muted-foreground">
                     JPG, PNG or GIF. Max size 5MB.
                   </p>
                 </div>
               </div>

              <Separator />

               {/* Form Fields */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="display_name">Display Name</Label>
                   <Input
                     id="display_name"
                     value={profileData.display_name}
                     onChange={(e) => handleProfileUpdate('display_name', e.target.value)}
                     placeholder="Your display name"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input
                     id="email"
                     type="email"
                     value={profileData.email}
                     disabled
                     className="bg-muted"
                   />
                   <p className="text-xs text-muted-foreground">
                     Email cannot be changed here
                   </p>
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="bio">Bio</Label>
                 <Textarea
                   id="bio"
                   placeholder="Tell fans about yourself and your art..."
                   value={profileData.bio}
                   onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                   rows={4}
                   maxLength={500}
                 />
                 <p className="text-sm text-muted-foreground">
                   {profileData.bio?.length || 0}/500 characters
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input
                     id="phone"
                     value={profileData.phone}
                     onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                     placeholder="+1 234 567 8900"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="website">Website</Label>
                   <Input
                     id="website"
                     value={profileData.website_url}
                     onChange={(e) => handleProfileUpdate('website_url', e.target.value)}
                     placeholder="https://yourwebsite.com"
                   />
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Links */}
              {socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <link.icon className="h-5 w-5" />
                  <span className="flex-1 font-medium">{link.platform}</span>
                  <span className="text-sm text-muted-foreground truncate">{link.url}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocialLink(link.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add New Link */}
              <div className="flex gap-2">
                <select
                  value={newSocialLink.platform}
                  onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                  className="px-3 py-2 border border-input rounded-md"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="website">Website</option>
                </select>
                <Input
                  placeholder="Enter URL..."
                  value={newSocialLink.url}
                  onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                  className="flex-1"
                />
                <Button onClick={addSocialLink}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

         {/* Settings Sidebar */}
         <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Profile Status</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center gap-2">
                 <Badge variant="default">Active User</Badge>
               </div>
               {profile?.avatar_url && (
                 <div className="flex items-center gap-2">
                   <Badge variant="secondary">Has Avatar</Badge>
                 </div>
               )}
               {profile?.bio && (
                 <div className="flex items-center gap-2">
                   <Badge variant="secondary">Bio Complete</Badge>
                 </div>
               )}
               <p className="text-sm text-muted-foreground">
                 Keep your profile updated to help fans connect with you.
               </p>
             </CardContent>
           </Card>

           <Button 
             className="w-full" 
             onClick={handleSaveChanges}
             disabled={loading}
           >
             <Save className="h-4 w-4 mr-2" />
             {loading ? 'Saving...' : 'Save Changes'}
           </Button>
        </div>
      </div>
    </div>
  );
}
