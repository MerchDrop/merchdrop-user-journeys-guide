import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
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
  const { signUpDesigner, signIn } = useAuth();
  const navigate = useNavigate();
  const { user } = useRoleRedirect({ skipRedirect: true });

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
          toast.success("Designer account created!", { 
            description: "Please check your email to verify. Your application is pending admin approval." 
          });
          navigate('/email-confirmation?role=designer');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-6">
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
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
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
      </div>
    </>
  );
}