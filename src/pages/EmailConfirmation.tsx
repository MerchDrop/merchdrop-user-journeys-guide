import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmation = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
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
          
          // Check if user is artist to determine redirect
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user!.id);

          const isArtist = userRoles?.some(role => role.role === 'artist');
          
          setStatus('success');
          toast.success('Email confirmed successfully!');
          
          // Redirect after a short delay
          setTimeout(() => {
            if (isArtist) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }, 2000);
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
  }, [searchParams, navigate]);

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
                {status === 'success' && 'Your email has been successfully confirmed. Redirecting you now...'}
                {status === 'error' && 'We encountered an issue confirming your email address.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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
};

export default EmailConfirmation;