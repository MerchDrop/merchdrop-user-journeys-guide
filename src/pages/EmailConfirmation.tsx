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
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {status === 'loading' && (
                  <div className="bg-primary/10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="bg-success/10">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-destructive/10">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                )}
              </div>
              
              <CardTitle className="text-2xl font-bold">
                {status === 'loading' && 'Confirming Email'}
                {status === 'success' && 'Email Confirmed!'}
                {status === 'error' && 'Confirmation Failed'}
              </CardTitle>
              
              <CardDescription>
                {status === 'loading' && 'Please wait while we confirm your email address...'}
                {status === 'success' && getRoleBasedDescription()}
                {status === 'error' && 'We encountered an issue confirming your email address.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {status === 'success' && (
                <>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground">
                        {getRoleBasedNextSteps()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={handlePrimaryAction} 
                        className="w-full group"
                      >
                        {getRoleBasedButtonText()}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/')} 
                        className="w-full"
                      >
                        Go to Home
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {status === 'error' && (
                <>
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button onClick={() => navigate('/artist-auth')} className="w-full">
                      Back to Sign In
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                      Go to Home
                    </Button>
                  </div>
                </>
              )}
              
              {status === 'loading' && (
                <div className="flex justify-center">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    This may take a few moments...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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