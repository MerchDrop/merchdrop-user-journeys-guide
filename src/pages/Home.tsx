import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import TrendingProducts from '@/components/home/TrendingProducts';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedArtists />
        <TrendingProducts />
      </main>
      <Footer />
    </div>
  );
}