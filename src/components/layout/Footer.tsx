import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
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
              Launch limited drops, manage orders, and ship globally—without inventory risk.
            </p>

            <form className="mt-5">
              <label htmlFor="email_subscribe" className="sr-only">Join our newsletter</label>
              <div className="flex items-stretch gap-2">
                <input 
                  id="email_subscribe" 
                  type="email" 
                  placeholder="you@studio.com" 
                  className="w-full h-10 px-3 rounded-md border text-[14px] border-border placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring bg-background"
                />
                <button 
                  type="submit" 
                  className="inline-flex items-center gap-2 h-10 px-3.5 rounded-md text-[14px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                By subscribing, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-foreground transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline hover:text-foreground transition-colors">Privacy</Link>.
              </p>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <a 
                href="#" 
                aria-label="Twitter" 
                className="h-9 w-9 rounded-md border flex items-center justify-center border-border hover:bg-muted transition-colors"
              >
                <Twitter className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="h-9 w-9 rounded-md border flex items-center justify-center border-border hover:bg-muted transition-colors"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                aria-label="YouTube" 
                className="h-9 w-9 rounded-md border flex items-center justify-center border-border hover:bg-muted transition-colors"
              >
                <Youtube className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Product</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><a href="#product" className="hover:text-foreground transition-colors">Overview</a></li>
              <li><a href="#how" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#shop" className="hover:text-foreground transition-colors">Shop</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Company</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Resources</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><Link to="/support" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h5 className="text-[13px] font-semibold tracking-tight text-foreground">Legal</h5>
            <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">DPA</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center gap-4 justify-between">
          <p className="text-[12px] text-muted-foreground">
            © {currentYear} MerchDrop, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
            <Link to="/admin-auth" className="hover:text-foreground transition-colors">Admin</Link>
            <a href="#" className="hover:text-foreground transition-colors">Sitemap</a>
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