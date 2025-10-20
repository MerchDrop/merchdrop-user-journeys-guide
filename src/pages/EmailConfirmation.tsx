import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight, Sparkles, Shield, Palette, ShoppingBag, Clock, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { OtpInput } from '@/components/auth/OtpInput';
import { Separator } from '@/components/ui/separator';

const EmailConfirmation = () => {
  const [userRole, setUserRole] = useState<'artist' | 'designer' | 'user'>('user');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  
  const [verificationMethod, setVerificationMethod] = useState<'magic-link' | 'otp'>('magic-link');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Determine user role from URL params or default to 'user'
    const role = searchParams.get('role') as 'artist' | 'designer' | 'user' | null;
    if (role && ['artist', 'designer', 'user'].includes(role)) {
      setUserRole(role);
    }

    // Get method from URL params or sessionStorage
    const method = searchParams.get('method') as 'magic-link' | 'otp' | null;
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    // Get stored email from sessionStorage
    const storedEmail = sessionStorage.getItem('verification_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }

    // If we have a token_hash, this is a magic link verification
    if (tokenHash && type) {
      setVerificationMethod('magic-link');
      setVerificationComplete(true);
      // Clear stored email after successful magic link verification
      sessionStorage.removeItem('verification_email');
    } else if (method === 'otp' && storedEmail) {
      // If method is OTP and we have email, show OTP input
      setVerificationMethod('otp');
    } else if (storedEmail) {
      // Default to OTP if we have email but no specific method
      setVerificationMethod('otp');
    } else {
      // No email stored, assume magic link flow
      setVerificationMethod('magic-link');
      setVerificationComplete(true);
    }

    // Check if user is signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session);
    });
  }, [searchParams]);

  const handleVerifyOtp = async (token: string) => {
    if (!userEmail) {
      toast.error('Email not found', { description: 'Please sign up again' });
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await verifyOtp(userEmail, token, 'signup');
      
      if (!error) {
        setVerificationComplete(true);
        sessionStorage.removeItem('verification_email');
        toast.success('Email verified!', { description: 'Your account has been activated' });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userEmail) {
      toast.error('Email not found', { description: 'Please sign up again' });
      return;
    }

    await resendOtp(userEmail, 'signup');
  };

  const switchToMagicLink = () => {
    toast.info('Check your email', { description: 'Click the magic link in your email to verify' });
    setVerificationMethod('magic-link');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-10 animate-fade-in-up">
              {/* Show OTP Input if verification is not complete and method is OTP */}
              {!verificationComplete && verificationMethod === 'otp' && userEmail && (
                <Card className="border-primary/20 bg-card shadow-design-card">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="bg-primary/10 rounded-full p-4">
                        <Mail className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    
                    <OtpInput
                      email={userEmail}
                      onVerify={handleVerifyOtp}
                      onResend={handleResendOtp}
                      isVerifying={isVerifying}
                    />

                    <Separator className="my-6" />

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Prefer a magic link instead?
                      </p>
                      <Button
                        variant="outline"
                        onClick={switchToMagicLink}
                        className="w-full"
                      >
                        Use Magic Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show magic link message if waiting for magic link */}
              {!verificationComplete && verificationMethod === 'magic-link' && (
                <Card className="border-primary/20 bg-card shadow-design-card">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-primary/10 rounded-full p-4">
                        <Mail className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">Check Your Email</h3>
                    <p className="text-muted-foreground">
                      We've sent you a magic link to verify your email address.
                      Click the link in the email to complete your registration.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Waiting for verification...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show success message after verification */}
              {verificationComplete && (
                <>
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
                {!isSignedIn && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')} 
                    className="w-full h-14 text-lg"
                    size="lg"
                  >
                    Sign In to Your Account
                  </Button>
                )}
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
                </>
              )}
          </div>
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
      user: { label: 'Start Designing', icon: <ShoppingBag className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
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
        return 'Unleash your creativity — start designing standout merch, team up with amazing artists, and watch your earnings grow with every sale!';
    }
  }

  function getRoleBasedButtonText() {
    switch (userRole) {
      case 'artist':
        return 'Complete My Artist Profile';
      case 'designer':
        return 'Complete My Designer Profile';
      default:
        return 'Start Designing';
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
        navigate('/designer/dashboard');
        break;
    }
  }
};

export default EmailConfirmation;