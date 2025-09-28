import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import KeyValueProps from '@/components/home/KeyValueProps';
import HowItWorks from '@/components/home/HowItWorks';
import Showcase from '@/components/home/Showcase';
import ShopArtistDrops from '@/components/home/ShopArtistDrops';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import MerchCategories from '@/components/home/MerchCategories';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { AssignDesignerRole } from '@/components/admin/AssignDesignerRole';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isAdmin } = useAuth();
  
  return (
    <>
      <SEOHelmet 
        title="MerchDrop - Launch Your Merch Line in Minutes"
        description="The ultimate platform for artists to create, sell, and monetize custom merchandise. Turn your creativity into a thriving business with MerchDrop."
        keywords="custom merchandise, artist platform, print on demand, merch store, creative business"
      />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <main className="w-full">
          <HeroSection />
          
          {/* Admin Role Assignment - temporary */}
          {user && isAdmin && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <AssignDesignerRole />
            </div>
          )}
          
          {/* Main Content Container - matches reference layout */}
          <div className="max-w-7xl mx-auto">
            <KeyValueProps />
            <HowItWorks />
            <Showcase />
            <FeaturedArtists />
            <ShopArtistDrops />
          </div>
          <MerchCategories />
        </main>
        <Footer />
      </div>
    </>
  );
}