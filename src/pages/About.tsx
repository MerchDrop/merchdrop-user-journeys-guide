import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { useCurrency } from '@/context/CurrencyContext';
import { Users, Target, Globe, Zap, TrendingUp, Award, Heart, Shield } from 'lucide-react';

export default function About() {
  const { formatPrice } = useCurrency();
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="About MerchDrop - Print-on-Demand Platform for Artists"
        description="Learn about MerchDrop's mission to empower artists and creators with our print-on-demand platform. Create, sell, and ship custom merchandise globally."
        keywords="about MerchDrop, print on demand, artist platform, custom merchandise"
      />
      <Header />
      <main className="overflow-hidden">
        {/* Hero Section - Gradient Background */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/8 via-background to-secondary/8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3"></div>
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8">
                <Heart className="w-4 h-4" />
                Built by creators, for creators
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-8">
                About MerchDrop
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Empowering artists and creators to build their brands through custom merchandise, 
                without the hassle of inventory management or upfront costs.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section - Clean White Background */}
        <section className="py-20 md:py-28 bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/10"></div>
          <div className="relative container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full mb-6">
                    <Target className="w-4 h-4" />
                    Our Mission
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Democratizing Creative Commerce
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      At MerchDrop, we believe every artist deserves the opportunity to monetize their creativity 
                      and build a sustainable business around their passion.
                    </p>
                    <p>
                      We've eliminated traditional barriers—no upfront costs, no inventory risks, 
                      no minimum orders, and no shipping headaches.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">10K+</h3>
                    <p className="text-sm text-muted-foreground">Active Artists</p>
                  </div>
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">50+</h3>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-card border rounded-2xl p-8 md:p-12 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Zero Risk Launch</h4>
                        <p className="text-muted-foreground">Start selling immediately with no upfront investment or inventory requirements.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Scale Globally</h4>
                        <p className="text-muted-foreground">Reach customers worldwide with our international shipping and fulfillment network.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Award className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Premium Quality</h4>
                        <p className="text-muted-foreground">High-quality products and printing that represents your brand with excellence.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Elevated Background with Borders */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-muted/30 via-muted/40 to-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4" />
                Our Values
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What Drives Us Forward</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These core principles guide every decision we make and every feature we build.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-background border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Creativity First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We prioritize artistic expression and provide tools that enhance, never limit, 
                  your creative vision.
                </p>
              </div>
              
              <div className="group bg-background border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Artist-Centric</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every decision we make is filtered through one question: "How does this benefit 
                  our artists?"
                </p>
              </div>
              
              <div className="group bg-background border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Global Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe great art should reach fans everywhere, connecting creators with 
                  audiences across the globe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work Section - Contrast Card Background */}
        <section className="py-20 md:py-28 bg-card border-y border-border/30 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-secondary/2"></div>
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">How We Work</h2>
                <p className="text-xl text-muted-foreground">
                  Seamless experience for both creators and customers
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="bg-background border rounded-xl p-6 shadow-sm">
                    <h3 className="text-2xl font-semibold mb-6 text-primary">For Artists</h3>
                    <div className="space-y-4">
                      {[
                        "Upload your designs in minutes",
                        "Set your own profit margins", 
                        "Access real-time analytics",
                        "Get paid weekly",
                        "Build your brand with custom storefronts"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-background border rounded-xl p-6 shadow-sm">
                    <h3 className="text-2xl font-semibold mb-6 text-secondary">For Customers</h3>
                    <div className="space-y-4">
                      {[
                        "Discover unique designs from independent artists",
                        "High-quality products printed on-demand",
                        "Fast, reliable shipping worldwide", 
                        "Direct support to your favorite creators",
                        "Sustainable, eco-friendly production"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Rich Gradient Background */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-muted/50 to-secondary/5 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">MerchDrop by the Numbers</h2>
              <p className="text-xl text-muted-foreground">
                Real impact, real growth, real success
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "10K+", label: "Active Artists", icon: Users },
                { value: "1M+", label: "Products Sold", icon: TrendingUp },
                { value: "50+", label: "Countries Served", icon: Globe },
                { value: `${formatPrice(2000000)}+`, label: "Paid to Artists", icon: Award }
              ].map((stat, index) => (
                <div key={index} className="text-center group bg-background/80 backdrop-blur-sm border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Final Clean Background */}
        <section className="py-20 md:py-28 bg-gradient-to-t from-background via-background to-muted/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Ready to Start Your Creative Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Join thousands of artists who've transformed their passion into profit with MerchDrop's 
                powerful platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Your Drop
                  <span className="text-xl">→</span>
                </a>
                <a 
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg text-lg font-medium border border-border hover:bg-muted transition-colors"
                >
                  Learn How It Works
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}