import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDesigners } from '@/hooks/useDesignersQuery';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { User, Mail, Calendar, Edit3, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DesignerProfileCompletionBanner } from './DesignerProfileCompletionBanner';
import { supabase } from '@/integrations/supabase/client';

export const DesignerProfile = () => {
  const { user, profile } = useAuth();
  const { formatPrice } = useCurrency();
  const { designerProfile, designs, updateDesignerProfile, createDesignerProfile, loading } = useDesigners();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    designer_name: designerProfile?.designer_name || '',
    bio: designerProfile?.bio || ''
  });

  console.log('[DesignerProfile] Component loaded, profile:', designerProfile, 'designs:', designs);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('[DesignerProfile] Saving profile:', formData);
      if (designerProfile) {
        await updateDesignerProfile(formData);
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved. This helps with approval!'
        });
      } else {
        await createDesignerProfile(formData.designer_name, formData.bio);
        toast.success('Profile created successfully', {
          description: 'Your profile is now set up. Upload designs to complete your application!'
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      designer_name: designerProfile?.designer_name || '',
      bio: designerProfile?.bio || ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.success('Avatar uploaded successfully!');
      
      window.location.reload();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!designerProfile) {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <DesignerProfileCompletionBanner 
          status="pending"
          designerName={formData.designer_name}
          bio={formData.bio}
          totalDesigns={0}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Create Your Designer Profile</CardTitle>
            <CardDescription>
              Set up your profile to start uploading designs. A complete profile helps speed up approval!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="designer_name">Designer Name *</Label>
                <Input
                  id="designer_name"
                  value={formData.designer_name}
                  onChange={(e) => setFormData({...formData, designer_name: e.target.value})}
                  placeholder="Your designer or brand name"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This is how you'll be displayed to artists and admins
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself and your design style (at least 20 characters recommended)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length} characters • A detailed bio helps with approval
                </p>
              </div>
              
              <Button type="submit" className="w-full">
                Create Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DesignerProfileCompletionBanner 
        status={designerProfile.status || 'pending'}
        designerName={designerProfile.designer_name}
        bio={designerProfile.bio}
        totalDesigns={designs?.length || designerProfile.total_designs || 0}
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Designer Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your public designer profile details</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="designer_name">Designer Name</Label>
                    <Input
                      id="designer_name"
                      value={formData.designer_name}
                      onChange={(e) => setFormData({...formData, designer_name: e.target.value})}
                      placeholder="Enter your designer name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself and your design style (at least 20 characters recommended)"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.bio?.length || 0} characters • A detailed bio helps with approval
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl">
                          {designerProfile.designer_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor="designer-avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors">
                          <Camera className="h-4 w-4" />
                        </div>
                      </Label>
                      <Input
                        id="designer-avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{designerProfile.designer_name}</h2>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Bio</h3>
                    <p className="text-muted-foreground">
                      {designerProfile.bio || 'No bio provided yet.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {format(new Date(designerProfile.created_at), 'MMMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{designerProfile.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Designs</span>
                  <span className="font-bold">{designerProfile.total_designs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-bold text-green-600">{designerProfile.approved_designs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-bold text-yellow-600">{designerProfile.pending_designs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Declined</span>
                  <span className="font-bold text-red-600">{designerProfile.declined_designs}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(designerProfile.total_earnings)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Approval Rate</span>
                    <span>
                      {designerProfile.total_designs ? 
                        ((designerProfile.approved_designs / designerProfile.total_designs) * 100).toFixed(1)
                        : '0'
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${designerProfile.total_designs ? 
                          (designerProfile.approved_designs / designerProfile.total_designs) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};