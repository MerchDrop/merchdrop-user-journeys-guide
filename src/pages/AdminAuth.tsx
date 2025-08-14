import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function AdminAuth() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    } else if (!loading && user && !isAdmin) {
      // If user is logged in but not admin, show error
      setError('Access denied. Admin privileges required.');
    }
  }, [user, isAdmin, loading, navigate]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Success will be handled by useEffect redirect
      toast.success('Welcome back, Admin!');
      
    } catch (err) {
      console.error('Admin sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHelmet 
        title="Admin Login - Secure Access"
        description="Secure admin login portal for platform administrators."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to main site */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Site
              </Button>
            </Link>
          </div>

          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Secure access for administrators only
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="username"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your secure password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Access Admin Portal
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  This is a secure admin portal. Unauthorized access is prohibited.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              All admin activities are monitored and logged for security purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}