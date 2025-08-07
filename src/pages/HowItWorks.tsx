import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HowItWorks from '@/components/home/HowItWorks';
import SEOHelmet from '@/components/SEO/SEOHelmet';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="How It Works - Create & Sell Custom Merch | MerchDrop"
        description="Learn how MerchDrop works. Simple steps to create, customize, and sell your merchandise online. Start your merch business today."
        keywords="how it works, create merchandise, sell merch online, custom products"
      />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">How It Works</h1>
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  );
}