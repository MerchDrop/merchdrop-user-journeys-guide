import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PendingApproval() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [rejectedRole, setRejectedRole] = useState<{ role: string; reason?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, status, rejection_reason')
          .eq('user_id', user.id)
          .in('status', ['pending', 'rejected']);

        if (error) throw error;

        const pending = data?.find(r => r.status === 'pending');
        const rejected = data?.find(r => r.status === 'rejected');

        if (pending) {
          setPendingRole(pending.role);
        } else if (rejected) {
          setRejectedRole({ role: rejected.role, reason: rejected.rejection_reason });
        } else {
          // No pending or rejected roles, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking role status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRoleStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rejectedRole) {
    return (
      <>
        <SEOHelmet 
          title="Account Application Rejected"
          description="Your account application status"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="max-w-2xl w-full border-destructive/20">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse"></div>
                    <XCircle className="h-24 w-24 text-destructive relative" strokeWidth={1.5} />
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-4 text-foreground">Application Not Approved</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Your <span className="font-semibold capitalize text-foreground">{rejectedRole.role}</span> account application was not approved
                </p>

                {rejectedRole.reason && (
                  <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
                    <h3 className="font-semibold mb-2 text-foreground">Reason:</h3>
                    <p className="text-muted-foreground">{rejectedRole.reason}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You can still use the platform as a regular user to browse and shop.
                  </p>
                  <div className="flex gap-4 justify-center pt-4">
                    <Button onClick={() => navigate('/')} variant="default">
                      Browse Shop
                    </Button>
                    <Button onClick={() => navigate('/contact')} variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHelmet 
        title="Pending Account Approval"
        description="Your account is pending approval by our admin team"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-12 pb-12 text-center">
              {/* Animated Icon */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  <Clock className="h-24 w-24 text-primary relative animate-[spin_3s_linear_infinite]" strokeWidth={1.5} />
                </div>
              </div>

              {/* Greeting */}
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                Welcome, {profile?.display_name || profile?.first_name || 'there'}!
              </h1>
              
              {/* Main Message */}
              <p className="text-xl text-muted-foreground mb-8">
                Your <span className="font-semibold capitalize text-primary">{pendingRole}</span> account is pending approval
              </p>

              {/* Timeline Section */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">What happens next?</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Our admin team will review your application within <span className="font-bold text-primary">48 hours</span>
                </p>
                
                {/* Steps */}
                <div className="grid gap-4 text-left max-w-md mx-auto">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Application Review</h3>
                      <p className="text-sm text-muted-foreground">Admin team reviews your profile and credentials</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email Notification</h3>
                      <p className="text-sm text-muted-foreground">You'll receive an email at <span className="font-mono text-xs">{user?.email}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Account Activation</h3>
                      <p className="text-sm text-muted-foreground">Once approved, you'll get full access to your {pendingRole} dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* In the meantime section */}
              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-3 text-foreground">In the meantime...</h3>
                <p className="text-muted-foreground mb-4">
                  You can browse the shop and explore what's available on the platform.
                </p>
                <Button onClick={() => navigate('/')} variant="outline" className="mt-2">
                  Browse Shop
                </Button>
              </div>

              {/* Pro Tip */}
              <div className="border-l-4 border-primary pl-4 text-left bg-primary/5 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-foreground mb-1">💡 Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  Make sure to check your email (including spam folder) for our approval notification!
                </p>
              </div>

              {/* Contact Support */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Have questions or need to update your application?
                </p>
                <Button onClick={() => navigate('/contact')} variant="ghost" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
}
