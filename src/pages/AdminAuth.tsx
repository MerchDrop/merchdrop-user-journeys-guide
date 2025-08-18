import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function AdminAuth() {
  const navigate = useNavigate();

  const handleEnterAdmin = () => {
    navigate('/admin');
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
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground mb-6">
                  Click below to enter the admin portal
                </p>
                
                <Button
                  onClick={handleEnterAdmin}
                  className="w-full h-11 text-base font-medium"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enter Admin Portal
                </Button>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Admin access is currently unrestricted for development
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