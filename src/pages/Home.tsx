import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import TrendingProducts from "@/components/home/TrendingProducts";
import HowItWorks from "@/components/home/HowItWorks";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedArtists />
        <TrendingProducts />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Home;