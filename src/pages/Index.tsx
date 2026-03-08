import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import { WorkPermitsSection, LogisticsSection, CTASection } from "@/components/HomeSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <WorkPermitsSection />
        <LogisticsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
