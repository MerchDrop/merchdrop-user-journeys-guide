import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight, Sparkles, Shield, Palette, ShoppingBag, Clock } from 'lucide-react';
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
            <div className="space-y-10 animate-fade-in-up">
              {/* Celebratory Success Hero */}
              <div className="text-center space-y-6">
                <div className="flex justify-center relative">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-success/20 rounded-full blur-3xl animate-pulse"></div>
                  </div>
                  
                  {/* Success icon with sparkles */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-success to-success/80 rounded-full p-8 shadow-design-focus">
                      <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 animate-bounce delay-100">
                      <Sparkles className="w-8 h-8 text-success fill-success" />
                    </div>
                    <div className="absolute -bottom-1 -left-2 animate-bounce delay-300">
                      <Sparkles className="w-6 h-6 text-success fill-success" />
                    </div>
                  </div>
                </div>

                {/* Heading with gradient */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Email Confirmed!
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                    {getRoleBasedDescription()}
                  </p>
                </div>

                {/* Role Badge */}
                {getRoleBadge()}
              </div>

              {/* Role-Specific Feature Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {getRoleFeatures().map((feature, index) => (
                  <Card 
                    key={index} 
                    className="border-border bg-card shadow-design-card hover:shadow-design-hover transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="bg-primary/5 rounded-full w-12 h-12 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Next Steps Timeline Card */}
              <Card className="border-success/20 bg-gradient-to-br from-card to-success/5 shadow-design-card">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-success/10 rounded-full p-3 shrink-0">
                      <ArrowRight className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h2 className="font-bold text-2xl mb-2">What Happens Next?</h2>
                      <p className="text-muted-foreground">
                        {getRoleBasedNextSteps()}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Steps */}
                  {userRole !== 'user' && (
                    <div className="ml-14 space-y-4 border-l-2 border-success/20 pl-6">
                      <div className="relative">
                        <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-success border-2 border-white"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-success" />
                            <h4 className="font-semibold">Review Process</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">Our team will review your application within 48 hours</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-border border-2 border-white"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-semibold">Approval Notification</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">You'll receive an email once your account is approved</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-border border-2 border-white"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-semibold">Start Creating</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">Begin {userRole === 'artist' ? 'selling your merchandise' : 'uploading designs'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Primary Actions */}
              <div className="space-y-4">
                <Button 
                  onClick={handlePrimaryAction} 
                  className="w-full h-14 text-lg group shadow-design-hover"
                  size="lg"
                >
                  {getRoleBasedButtonText()}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="h-12"
                  >
                    Go to Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/shop')} 
                    className="h-12"
                  >
                    Browse Shop
                  </Button>
                </div>
              </div>

              {/* Help text */}
              <p className="text-center text-sm text-muted-foreground">
                Need help? <button onClick={() => navigate('/support')} className="text-primary hover:underline font-medium">Contact our support team</button>
              </p>
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
        return 'Welcome to Merchdrop! Your artist journey begins now.';
      case 'designer':
        return 'Welcome to Merchdrop! Start creating amazing designs.';
      default:
        return 'Welcome to Merchdrop! Discover exclusive artist merchandise.';
    }
  }

  function getRoleBadge() {
    const badges = {
      artist: { label: 'Artist Account', icon: <Palette className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
      designer: { label: 'Designer Account', icon: <Sparkles className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
      user: { label: 'Shopper Account', icon: <ShoppingBag className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
    };

    const badge = badges[userRole];

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white font-semibold shadow-lg animate-fade-in-up delay-200`}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  }

  function getRoleFeatures() {
    switch (userRole) {
      case 'artist':
        return [
          {
            icon: <Palette className="w-6 h-6 text-primary" />,
            title: 'Your Artist Hub',
            description: 'Manage your products, track sales, and grow your brand'
          },
          {
            icon: <Shield className="w-6 h-6 text-primary" />,
            title: 'Verified Status',
            description: 'Build trust with customers through verified artist badge'
          },
          {
            icon: <Clock className="w-6 h-6 text-primary" />,
            title: '48-Hour Review',
            description: 'Quick approval process to get you started selling'
          }
        ];
      case 'designer':
        return [
          {
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            title: 'Creative Studio',
            description: 'Upload and manage your design portfolio'
          },
          {
            icon: <Palette className="w-6 h-6 text-primary" />,
            title: 'Collaborate',
            description: 'Work with artists to bring designs to life'
          },
          {
            icon: <Clock className="w-6 h-6 text-primary" />,
            title: 'Fast Approval',
            description: 'Get reviewed within 48 hours and start earning'
          }
        ];
      default:
        return [
          {
            icon: <ShoppingBag className="w-6 h-6 text-primary" />,
            title: 'Exclusive Merch',
            description: 'Shop unique items from verified artists'
          },
          {
            icon: <Shield className="w-6 h-6 text-primary" />,
            title: 'Secure Shopping',
            description: 'Safe and protected checkout experience'
          },
          {
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            title: 'Support Artists',
            description: 'Every purchase directly supports creators'
          }
        ];
    }
  }

  function getRoleBasedNextSteps() {
    switch (userRole) {
      case 'artist':
        return 'Complete your artist profile with your bio, branding, and social links. Our team will review your application and notify you via email.';
      case 'designer':
        return 'Complete your designer profile with your portfolio and bio. Our team will review your application and notify you via email.';
      default:
        return 'Start exploring unique merchandise from talented artists, add items to your wishlist, and enjoy exclusive drops!';
    }
  }

  function getRoleBasedButtonText() {
    switch (userRole) {
      case 'artist':
        return 'Complete My Artist Profile';
      case 'designer':
        return 'Complete My Designer Profile';
      default:
        return 'Start Shopping Now';
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