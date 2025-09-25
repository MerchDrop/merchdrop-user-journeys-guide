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

  // Redirect if not authenticated or not an artist
  useEffect(() => {
    if (!loading && (!user || !isArtist)) {
      navigate('/artist-auth', { replace: true });
    }
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
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Create artist slug from display name
      const artistSlug = formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      // Create artist profile
      const { error: profileError } = await supabase
        .from('artist_profiles')
        .insert({
          user_id: user.id,
          artist_name: formData.displayName,
          artist_slug: artistSlug,
          status: 'pending'
        });

      if (profileError) {
        toast.error('Failed to create artist profile: ' + profileError.message);
        return;
      }

      // Update user profile with bio and social links
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          social_links: formData.socialLinks
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }

      toast.success('Artist profile created successfully!');
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
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
                          src={formData.profilePicture ? URL.createObjectURL(formData.profilePicture) : undefined} 
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