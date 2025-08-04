import React, { useState } from 'react';
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
  const [profileData, setProfileData] = useState({
    name: 'John Artist',
    bio: 'Creating unique designs and bringing artistic visions to life through merch.',
    email: 'john.artist@example.com',
    phone: '+1 234 567 8900',
    profileImage: '/placeholder.svg',
    isPublic: true,
    allowMessages: true,
    emailNotifications: true,
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', platform: 'instagram', url: 'https://instagram.com/johnartist', icon: Instagram },
    { id: '2', platform: 'twitter', url: 'https://twitter.com/johnartist', icon: Twitter },
  ]);

  const [newSocialLink, setNewSocialLink] = useState({ platform: 'instagram', url: '' });

  const handleProfileUpdate = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addSocialLink = () => {
    if (newSocialLink.url) {
      const newLink: SocialLink = {
        id: Date.now().toString(),
        platform: newSocialLink.platform,
        url: newSocialLink.url,
        icon: platformIcons[newSocialLink.platform as keyof typeof platformIcons],
      };
      setSocialLinks(prev => [...prev, newLink]);
      setNewSocialLink({ platform: 'instagram', url: '' });
    }
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
  };

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
                  <AvatarImage src={profileData.profileImage} />
                  <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Artist Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  />
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
                />
                <p className="text-sm text-muted-foreground">
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                />
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
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Switch
                  checked={profileData.isPublic}
                  onCheckedChange={(checked) => handleProfileUpdate('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let fans send you direct messages
                  </p>
                </div>
                <Switch
                  checked={profileData.allowMessages}
                  onCheckedChange={(checked) => handleProfileUpdate('allowMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about orders and sales
                  </p>
                </div>
                <Switch
                  checked={profileData.emailNotifications}
                  onCheckedChange={(checked) => handleProfileUpdate('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Verified Artist</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Profile Complete</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile is 95% complete. Add more social links to reach 100%.
              </p>
            </CardContent>
          </Card>

          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
