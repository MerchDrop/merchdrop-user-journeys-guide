import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in-up">
            <Sparkles className="w-3 h-3 mr-1" />
            Now Live: Creator Revenue Sharing 50/50
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up delay-100">
            Turn Your
            <span className="bg-hero-gradient bg-clip-text text-transparent"> Creativity </span>
            Into Revenue
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in-up delay-200">
            Join thousands of artists who are already monetizing their brand with custom merchandise. 
            Create, sell, and earn with zero upfront costs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up delay-300">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/signup">
                Start Creating Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up delay-400">
            <div className="flex items-center space-x-3">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Artists</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">$2M+</div>
                <div className="text-sm text-muted-foreground">Artist Earnings</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold">50/50</div>
                <div className="text-sm text-muted-foreground">Revenue Split</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-40 right-40 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse-glow hidden lg:block" />
    </section>
  );
};

export default HeroSection;