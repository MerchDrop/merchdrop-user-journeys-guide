import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function About() {
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="About MerchDrop - Print-on-Demand Platform for Artists"
        description="Learn about MerchDrop's mission to empower artists and creators with our print-on-demand platform. Create, sell, and ship custom merchandise globally."
        keywords="about MerchDrop, print on demand, artist platform, custom merchandise"
      />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About MerchDrop</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering artists and creators to build their brands through custom merchandise, 
              without the hassle of inventory management or upfront costs.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At MerchDrop, we believe every artist deserves the opportunity to monetize their creativity 
                and build a sustainable business around their passion.
              </p>
              <p className="text-muted-foreground mb-4">
                We've built a platform that eliminates the traditional barriers to merchandise creation—
                no upfront costs, no inventory risks, no minimum orders, and no shipping headaches.
              </p>
              <p className="text-muted-foreground">
                Our print-on-demand model means you can focus on what you do best: creating amazing art 
                while we handle the rest.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Why We Started MerchDrop</h3>
              <p className="text-muted-foreground">
                Founded by artists who understood the struggle of turning creativity into income, 
                MerchDrop was born from the frustration of seeing talented creators held back by 
                traditional merchandise barriers.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Creativity First</h3>
                <p className="text-muted-foreground">
                  We prioritize artistic expression and provide tools that enhance, never limit, 
                  your creative vision.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Artist-Centric</h3>
                <p className="text-muted-foreground">
                  Every decision we make is filtered through one question: "How does this benefit 
                  our artists?"
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Reach</h3>
                <p className="text-muted-foreground">
                  We believe great art should reach fans everywhere, which is why we offer 
                  worldwide shipping and localized experiences.
                </p>
              </div>
            </div>
          </div>

          {/* How We Work Section */}
          <div className="bg-muted/50 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">How We Work</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">For Artists</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Upload your designs in minutes</li>
                  <li>• Set your own profit margins</li>
                  <li>• Access real-time analytics</li>
                  <li>• Get paid weekly</li>
                  <li>• Build your brand with custom storefronts</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">For Customers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Discover unique designs from independent artists</li>
                  <li>• High-quality products printed on-demand</li>
                  <li>• Fast, reliable shipping worldwide</li>
                  <li>• Direct support to your favorite creators</li>
                  <li>• Sustainable, eco-friendly production</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8">MerchDrop by the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <p className="text-muted-foreground">Active Artists</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <p className="text-muted-foreground">Products Sold</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Countries Served</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
                <p className="text-muted-foreground">Paid to Artists</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Built by Creators, for Creators</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Our team combines deep technical expertise with real artistic experience. 
              We're not just building software—we're crafting the future of creative commerce.
            </p>
            <div className="inline-flex items-center gap-4 bg-primary/10 rounded-lg px-6 py-4">
              <span className="text-sm font-medium">Ready to start your creative business?</span>
              <a 
                href="/"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Your Drop
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}