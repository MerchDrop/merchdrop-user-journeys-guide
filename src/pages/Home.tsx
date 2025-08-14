import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import KeyValueProps from '@/components/home/KeyValueProps';
import HowItWorks from '@/components/home/HowItWorks';
import Showcase from '@/components/home/Showcase';
import ShopArtistDrops from '@/components/home/ShopArtistDrops';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function Home() {
  return (
    <>
      <SEOHelmet 
        title="MerchDrop - Launch Your Merch Line in Minutes"
        description="The ultimate platform for artists to create, sell, and monetize custom merchandise. Turn your creativity into a thriving business with MerchDrop."
        keywords="custom merchandise, artist platform, print on demand, merch store, creative business"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full">
          <HeroSection />
          
          {/* Main Content Container - matches reference layout */}
          <div className="max-w-7xl mx-auto">
            <KeyValueProps />
            <HowItWorks />
            <Showcase />
            <FeaturedArtists />
            <ShopArtistDrops />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}