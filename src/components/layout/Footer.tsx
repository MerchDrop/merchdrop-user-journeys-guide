import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed', description: 'This email is already on our list.' });
        } else {
          toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Subscribed!', description: "You're on the list. We'll keep you in the loop." });
        setEmail('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative border-t border-border bg-background w-full" style={{ zIndex: 10, minHeight: '200px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/f708172b-4051-49f4-9f48-2681025d79d3.png"
                alt="MerchDrop"
                className="h-9 w-auto"
              />
            </div>
            <p className="mt-4 text-[14px] text-muted-foreground max-w-sm">
              Shop exclusive limited drops from your favorite artists and step into their world.
            </p>

            <form className="mt-5" onSubmit={handleSubscribe}>
              <label htmlFor="email_subscribe" className="sr-only">Join our newsletter</label>
              <div className="flex items-stretch gap-2">
                <input
                  id="email_subscribe"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border text-[14px] border-border placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring bg-background"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 h-10 px-3.5 rounded-md text-[14px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                By subscribing, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-foreground transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline hover:text-foreground transition-colors">Privacy</Link>.
              </p>
            </form>

          </div>

          {/* Link Columns */}
          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Company</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Legal</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center gap-4 justify-between">
          <p className="text-[12px] text-muted-foreground">
            © {currentYear} MerchDrop, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <div className="hidden md:inline-block h-4 w-px bg-border"></div>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;