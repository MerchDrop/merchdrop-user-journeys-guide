import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, Lock, User, ArrowLeft, ThumbsUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { toast } from "sonner";
import { getAuthErrorMessage, getRoleUpgradeMessage } from '@/lib/authErrorMessages';
import merchdropLogo from "@/assets/merchdrop-logo.png";
import { supabase } from "@/integrations/supabase/client";

const ArtistAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { signUpArtist, signIn, user, loading, isSuperAdmin, isAdmin, isDesigner, isArtist } = useAuth();
  const navigate = useNavigate();
  
  // Use role redirect hook - skip redirect to allow manual control
  useRoleRedirect({ 
    skipRedirect: true,
    defaultPath: '/dashboard' 
  });

  // Redirect based on user role after successful auth
  useEffect(() => {
    const checkRedirect = async () => {
      if (user && !loading) {
        if (isSuperAdmin || isAdmin) {
          navigate('/admin');
          return;
        } 
        
        if (isDesigner) {
          navigate('/designer/dashboard');
          return;
        } 
        
        if (isArtist) {
          navigate('/dashboard');
          return;
        }
        
        // Check if artist profile is approved (resilient to role sync issues)
        const { data: artistProfile } = await supabase
          .from('artist_profiles')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (artistProfile?.status === 'approved') {
          navigate('/dashboard');
          return;
        }
        
        navigate('/');
      }
    };
    
    checkRedirect();
  }, [user, loading, isSuperAdmin, isAdmin, isDesigner, isArtist, navigate]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while auth is initializing
  if (loading) {
    console.log('ArtistAuth: Still loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUpArtist({
          email: formData.email,
          password: formData.password,
          displayName: `${formData.firstName} ${formData.lastName}`.trim()
        });
        
        if (error) {
          console.error('Artist sign up error:', error);
          const errorInfo = getAuthErrorMessage(error, 'signup');
          toast.error(errorInfo.title, { description: errorInfo.message });
        } else {
          setShowSuccessDialog(true);
        }
      } else {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          console.error('Artist sign in error:', error);
          const errorInfo = getAuthErrorMessage(error, 'signin');
          toast.error(errorInfo.title, { description: errorInfo.message });
        } else {
          toast.success("Welcome back!");
          // useRoleRedirect hook will handle navigation
        }
      }
    } catch (error: any) {
      console.error('Artist auth error:', error);
      const errorInfo = getAuthErrorMessage(error, isSignUp ? 'signup' : 'signin');
      toast.error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img src={merchdropLogo} alt="Merchdrop" className="w-8 h-8 object-contain" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? "Start Your" : "Welcome"} <span className="text-accent">Creator Journey</span>
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? "Join thousands of artists already earning through their creativity"
                  : "Sign in to your artist account to manage your store"
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    <PasswordInput
                      id="password"
                      name="password"
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex justify-end">
                    <Button variant="link" asChild className="px-0 text-sm text-muted-foreground">
                      <Link to="/forgot-password">Forgot password?</Link>
                    </Button>
                  </div>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    isSignUp ? "Create Artist Account" : "Sign In"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Just want to shop?</p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/user-auth">
                    Join as a Customer
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Are you a designer?</p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/designer-auth">
                    Join as a Designer
                  </Link>
                </Button>
              </div>

              {isSignUp && (
                <div className="text-center text-sm text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                <ThumbsUp className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl">Thanks for joining MerchDrop!</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Kindly check your email for confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction 
              onClick={() => {
                setShowSuccessDialog(false);
                setIsSignUp(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  confirmPassword: ""
                });
              }}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArtistAuth;