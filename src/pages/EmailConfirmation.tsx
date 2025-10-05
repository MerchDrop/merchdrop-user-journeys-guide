import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmation = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [userRole, setUserRole] = useState<'artist' | 'designer' | 'user'>('user');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        console.log('EmailConfirmation: Processing confirmation with params:', {
          token: !!token,
          type,
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          fullUrl: window.location.href
        });

        // Check if user accessed this page directly without confirmation tokens
        if (!accessToken && !refreshToken && !token) {
          setError('Invalid confirmation link. Please check your email for the correct confirmation link.');
          setStatus('error');
          toast.error('Invalid confirmation link');
          return;
        }

        if (accessToken && refreshToken) {
          // Handle email confirmation with tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('EmailConfirmation: Session error:', error);
            throw error;
          }

          console.log('EmailConfirmation: Session set successfully:', data.user?.id);
          
          // Check user role to determine next steps
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user!.id);

          const isArtist = userRoles?.some(role => role.role === 'artist');
          const isDesigner = userRoles?.some(role => role.role === 'designer');
          
          // Set user role for UI display
          if (isArtist) {
            setUserRole('artist');
          } else if (isDesigner) {
            setUserRole('designer');
          } else {
            setUserRole('user');
          }
          
          setStatus('success');
          toast.success('Email confirmed successfully!');
        } else if (token && type) {
          // Handle token-based confirmation
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any
          });

          if (error) {
            console.error('EmailConfirmation: Token verification error:', error);
            throw error;
          }

          setStatus('success');
          toast.success('Email confirmed successfully!');
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          throw new Error('Missing or invalid confirmation tokens');
        }
      } catch (error: any) {
        console.error('EmailConfirmation: Error:', error);
        setError(error.message || 'Failed to confirm email');
        setStatus('error');
        toast.error('Email confirmation failed: ' + error.message);
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {status === 'success' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-success rounded-full p-6">
                    <CheckCircle className="w-16 h-16 text-success-foreground" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Confirmation Successful!
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {getRoleBasedDescription()}
                </p>
              </div>

              {/* Next Steps Card */}
              <Card className="border-success/20 bg-card shadow-design-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-success/10 rounded-full p-3 shrink-0">
                      <ArrowRight className="w-5 h-5 text-success" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">What's Next?</h3>
                      <p className="text-muted-foreground">
                        {getRoleBasedNextSteps()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handlePrimaryAction} 
                  className="w-full h-12 text-base group"
                  size="lg"
                >
                  {getRoleBasedButtonText()}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-8 animate-fade-in-up text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-primary/10 rounded-full p-6">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Confirming Email
                </h1>
                <p className="text-lg text-muted-foreground">
                  Please wait while we confirm your email address...
                </p>
                <p className="text-sm text-muted-foreground animate-pulse">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"></div>
                  <div className="relative bg-destructive/10 rounded-full p-6">
                    <XCircle className="w-16 h-16 text-destructive" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Confirmation Failed
                </h1>
                <p className="text-lg text-muted-foreground">
                  We encountered an issue confirming your email address
                </p>
              </div>

              {error && (
                <Card className="border-destructive/20 bg-card shadow-design-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-destructive/10 rounded-full p-3 shrink-0">
                        <XCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Error Details</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/artist-auth')} 
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Back to Sign In
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getRoleBasedDescription() {
    switch (userRole) {
      case 'artist':
        return 'Your email has been confirmed! Complete your profile while we review your artist application.';
      case 'designer':
        return 'Your email has been confirmed! Complete your profile while we review your designer application.';
      default:
        return 'Your email has been confirmed! You can now start shopping for exclusive artist merchandise.';
    }
  }

  function getRoleBasedNextSteps() {
    switch (userRole) {
      case 'artist':
        return '✨ Next: Complete your artist profile with your bio, branding, and social links. Our team will review your application within 48 hours.';
      case 'designer':
        return '✨ Next: Complete your designer profile with your portfolio and bio. Our team will review your application within 48 hours.';
      default:
        return '🛍️ Start exploring unique merchandise from talented artists and add your favorites to your wishlist!';
    }
  }

  function getRoleBasedButtonText() {
    switch (userRole) {
      case 'artist':
        return 'Complete My Artist Profile';
      case 'designer':
        return 'Complete My Designer Profile';
      default:
        return 'Start Shopping';
    }
  }

  function handlePrimaryAction() {
    switch (userRole) {
      case 'artist':
        navigate('/dashboard/profile');
        break;
      case 'designer':
        navigate('/designer/profile');
        break;
      default:
        navigate('/shop');
        break;
    }
  }
};

export default EmailConfirmation;