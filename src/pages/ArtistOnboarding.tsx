import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Upload, 
  Instagram, 
  Music, 
  Globe,
  Check,
  ArrowRight,
  ArrowLeft 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ArtistOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    profilePicture: null as File | null,
    socialLinks: {
      instagram: '',
      tiktok: '',
      spotify: '',
      website: ''
    }
  });

  const { user, isArtist, loading } = useAuth();
  const navigate = useNavigate();

  // Create and cleanup blob URL for profile picture preview
  useEffect(() => {
    if (formData.profilePicture) {
      const url = URL.createObjectURL(formData.profilePicture);
      setProfilePictureUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfilePictureUrl('');
    }
  }, [formData.profilePicture]);

  // Redirect if not authenticated or not an artist
  useEffect(() => {
    console.log('ArtistOnboarding: user:', user, 'loading:', loading, 'isArtist:', isArtist);
    
    if (loading) {
      console.log('ArtistOnboarding: Still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('ArtistOnboarding: No user, redirecting to artist-auth');
      navigate('/artist-auth', { replace: true });
      return;
    }
    
    if (!isArtist) {
      console.log('ArtistOnboarding: User is not artist, redirecting to artist-auth');
      navigate('/artist-auth', { replace: true });
      return;
    }
    
    // Check if artist has already completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const { data: artistProfile, error } = await supabase
          .from('artist_profiles')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('ArtistOnboarding: Error checking artist profile:', error);
          return;
        }

        // If artist profile exists and is approved, redirect to dashboard
        if (artistProfile && artistProfile.status === 'approved') {
          console.log('ArtistOnboarding: Artist has already completed onboarding, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }

        console.log('ArtistOnboarding: Artist needs to complete onboarding, staying on page');
      } catch (error) {
        console.error('ArtistOnboarding: Error in checkOnboardingStatus:', error);
      }
    };

    checkOnboardingStatus();
    
    console.log('ArtistOnboarding: User is authenticated artist, checking onboarding status');
  }, [user, isArtist, loading, navigate]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('ArtistOnboarding: No user found in handleSubmit');
      toast.error('User not found. Please log in again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('ArtistOnboarding: Starting profile creation for user:', user.id);
      
      // Create artist slug from display name
      const artistSlug = formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      // Upload profile picture if provided
      let avatarUrl = '';
      if (formData.profilePicture) {
        try {
          const fileExt = formData.profilePicture.name.split('.').pop();
          const fileName = `${user.id}/avatar.${fileExt}`;
          
          await supabase.storage.from('avatars').remove([fileName]);
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, formData.profilePicture, { upsert: true });

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
          } else {
            const { data } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
        }
      }

      // First check if artist profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('ArtistOnboarding: Error checking existing profile:', checkError);
        toast.error('Failed to check existing profile: ' + checkError.message);
        return;
      }

      if (existingProfile) {
        console.log('ArtistOnboarding: Updating existing artist profile');
        // Update existing profile
        const { error: updateError } = await supabase
          .from('artist_profiles')
          .update({
            artist_name: formData.displayName,
            artist_slug: artistSlug,
            status: 'approved' // Mark as approved when they complete onboarding
          })
          .eq('user_id', user.id);

        if (updateError) {
          toast.error('Failed to update artist profile: ' + updateError.message);
          return;
        }
      } else {
        console.log('ArtistOnboarding: Creating new artist profile');
        // Create new artist profile
        const { error: createError } = await supabase
          .from('artist_profiles')
          .insert({
            user_id: user.id,
            artist_name: formData.displayName,
            artist_slug: artistSlug,
            status: 'approved' // Mark as approved when they complete onboarding
          });

        if (createError) {
          toast.error('Failed to create artist profile: ' + createError.message);
          return;
        }
      }

      // Update user profile with bio and social links
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          social_links: formData.socialLinks,
          display_name: formData.displayName,
          ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('ArtistOnboarding: Error updating profile:', updateError);
        // Don't fail the whole process for this
      }

      console.log('ArtistOnboarding: Profile creation successful');
      toast.success('Artist profile completed successfully!');
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('ArtistOnboarding: Error in handleSubmit:', error);
      toast.error('Failed to create profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Complete Your Artist Profile</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="shadow-hero">
            <CardContent className="p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl mb-2">Tell us about yourself</CardTitle>
                    <p className="text-muted-foreground">
                      This information will be displayed on your artist profile
                    </p>
                  </CardHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Artist/Display Name *</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Your artist name"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio *</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell your fans about your music, style, and what makes you unique..."
                        className="mt-1 min-h-[120px]"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Profile Picture */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl mb-2">Profile Picture</CardTitle>
                    <p className="text-muted-foreground">
                      Upload a high-quality photo that represents your brand
                    </p>
                  </CardHeader>

                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32">
                        <AvatarImage 
                          src={profilePictureUrl || undefined} 
                        />
                        <AvatarFallback className="text-2xl">
                          <User className="w-16 h-16" />
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center">
                      <Label htmlFor="profilePicture" className="cursor-pointer">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Upload Photo</span>
                        </div>
                      </Label>
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Recommended: Square image, at least 400x400px
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Social Links */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl mb-2">Connect Your Socials</CardTitle>
                    <p className="text-muted-foreground">
                      Help fans find you on other platforms (optional)
                    </p>
                  </CardHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instagram" className="flex items-center space-x-2">
                        <Instagram className="w-4 h-4" />
                        <span>Instagram</span>
                      </Label>
                      <Input
                        id="instagram"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                        placeholder="@yourusername"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="spotify" className="flex items-center space-x-2">
                        <Music className="w-4 h-4" />
                        <span>Spotify/Music Platform</span>
                      </Label>
                      <Input
                        id="spotify"
                        value={formData.socialLinks.spotify}
                        onChange={(e) => handleInputChange('social.spotify', e.target.value)}
                        placeholder="Your artist name on Spotify"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website" className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                      </Label>
                      <Input
                        id="website"
                        value={formData.socialLinks.website}
                        onChange={(e) => handleInputChange('social.website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < totalSteps ? (
                  <Button 
                    onClick={nextStep}
                    variant="hero"
                    className="flex items-center space-x-2"
                    disabled={currentStep === 1 && (!formData.displayName || !formData.bio)}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    variant="hero"
                    className="flex items-center space-x-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Creating Profile...' : 'Complete Profile'}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArtistOnboarding;