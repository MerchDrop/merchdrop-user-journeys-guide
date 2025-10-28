import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ThumbsUp, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { Header } from '@/components/layout/Header';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { toast } from 'sonner';
import { getAuthErrorMessage, getRoleUpgradeMessage } from '@/lib/authErrorMessages';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  designerName: string;
  bio: string;
}

export default function DesignerAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    designerName: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { signUpDesigner, signIn, signOut, user } = useAuth();
  const navigate = useNavigate();
  useRoleRedirect({ skipRedirect: true, defaultPath: '/designer-auth' });

  // Fetch designer profile if user is signed in
  useEffect(() => {
    const fetchDesignerProfile = async () => {
      if (user) {
        console.log('[DesignerAuth] Fetching designer profile for user:', user.id);
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('designer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          console.log('[DesignerAuth] Designer profile found:', data);
          setDesignerProfile(data);
        } else if (error) {
          console.log('[DesignerAuth] No designer profile found or error:', error);
        }
        setProfileLoading(false);
      } else {
        setProfileLoading(false);
      }
    };

    fetchDesignerProfile();
  }, [user]);

  // Determine button text and action based on profile state
  const getProfileButtonText = () => {
    if (!designerProfile) return 'Set Up My Profile';
    if (designerProfile.designer_name && designerProfile.bio) return 'View My Profile';
    return 'Complete My Profile';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Validate required fields for sign up
        if (!formData.firstName || !formData.lastName || !formData.designerName) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        // Sign up the designer
        const { error: authError } = await signUpDesigner({
          email: formData.email,
          password: formData.password,
          displayName: formData.designerName
        });

        if (authError) {
          const errorInfo = getAuthErrorMessage(authError, 'signup');
          setError(errorInfo.message);
          toast.error(errorInfo.title, { description: errorInfo.message });
          throw authError;
        } else {
          setShowSuccessDialog(true);
        }
      } else {
        // Sign in
        const { error } = await signIn({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          const errorInfo = getAuthErrorMessage(error, 'signin');
          setError(errorInfo.message);
          toast.error(errorInfo.title, { description: errorInfo.message });
          throw error;
        }
        
        toast.success('Welcome back!');
        // useRoleRedirect hook will handle navigation
      }
    } catch (error: any) {
      console.error('Designer auth error:', error);
      // Error already handled above
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHelmet 
        title={`Designer Portal ${isSignUp ? 'Sign Up' : 'Sign In'} - MergeDrop`}
        description={`${isSignUp ? 'Join' : 'Sign in to'} the MergeDrop Designer Portal to upload designs and manage your portfolio`}
      />
      <Header />
      
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-success/10 rounded-full p-6">
                <ThumbsUp className="w-12 h-12 text-success" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl">Welcome to MerchDrop!</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Thanks for joining MerchDrop! Kindly check your email for confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                setIsSignUp(false);
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: '',
                  designerName: '',
                  bio: ''
                });
              }}
              className="w-full sm:w-auto px-8"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-6">
        {/* Show status card if user is signed in and has designer profile */}
        {user && designerProfile && !profileLoading ? (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              {designerProfile.status === 'pending' ? (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-6">
                      <Clock className="h-16 w-16 text-amber-600 dark:text-amber-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Your Application is Pending</h2>
                    <p className="text-muted-foreground">We're reviewing your designer application</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our admin team will review your application within 48 hours. You'll receive an email once approved.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        console.log('[DesignerAuth] Navigating to profile page');
                        navigate('/designer/profile');
                      }}
                      className="w-full"
                      size="lg"
                    >
                      {getProfileButtonText()}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {!designerProfile?.bio || !designerProfile?.designer_name
                        ? 'Complete your profile to help speed up the review process'
                        : 'Review and update your profile information'}
                    </p>
                  </div>
                </div>
              ) : designerProfile.status === 'active' ? (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
                      <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">You're All Set!</h2>
                    <p className="text-muted-foreground">Your designer account is active</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You already have access to your dashboard.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/designer/dashboard')}
                      className="w-full"
                      size="lg"
                    >
                      View Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => signOut()}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : !user && !profileLoading ? (
          <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Designer Portal</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create your designer account' : 'Sign in with your designer credentials'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designerName">Designer Name</Label>
                    <Input
                      id="designerName"
                      name="designerName"
                      value={formData.designerName}
                      onChange={handleInputChange}
                      placeholder="Your designer/brand name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself and your design style"
                      className="min-h-[80px]"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                  />
                  </div>
                )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <Button variant="link" asChild className="px-0 text-sm text-muted-foreground">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </Button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>
        ) : null}
      </div>
    </>
  );
}