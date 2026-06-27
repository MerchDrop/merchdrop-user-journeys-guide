import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, ArrowLeft, ShoppingBag, UserCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { toast } from "sonner";
import { getAuthErrorMessage, getRoleUpgradeMessage } from '@/lib/authErrorMessages';

const UserAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signOut, user, loading, isSuperAdmin, isAdmin, isDesigner, isArtist } = useAuth();
  const navigate = useNavigate();
  
  // Use role redirect hook - skip redirect to show status for signed-in users
  useRoleRedirect({ 
    skipRedirect: true,
    defaultPath: '/' 
  });

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
        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          displayName: `${formData.firstName} ${formData.lastName}`.trim()
        });
        
        if (error) {
          const errorInfo = getAuthErrorMessage(error, 'signup');
          toast.error(errorInfo.title, { description: errorInfo.message });
        } else {
          toast.success("Account created!", { description: "Please check your email to verify your account." });
          navigate('/products');
        }
      } else {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          const errorInfo = getAuthErrorMessage(error, 'signin');
          toast.error(errorInfo.title, { description: errorInfo.message });
        } else {
          toast.success("Welcome back!");
          // useRoleRedirect hook will handle navigation
        }
      }
    } catch (error: any) {
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

          {/* Show status card if user is signed in */}
          {user && !loading ? (
            <Card className="shadow-hero">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-6">
                      <UserCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">You're Already Signed In!</h2>
                    <p className="text-muted-foreground">You're currently signed in as</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/')}
                      className="w-full"
                      size="lg"
                      variant="hero"
                    >
                      Continue Shopping
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
              </CardContent>
            </Card>
          ) : !user && !loading ? (
            <Card className="shadow-hero">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? "Join as a" : "Welcome"} <span className="bg-hero-gradient bg-clip-text text-transparent">Customer</span>
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? "Create your account to start shopping amazing artist merch"
                  : "Sign in to continue shopping and track your orders"
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
                    isSignUp ? "Create Account" : "Sign In"
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
                <p className="text-sm text-muted-foreground mb-2">Want to sell your art?</p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/artist-auth">
                    Join as an Artist
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserAuth;