import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import BackToTop from "@/components/BackToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WorkPermitsSection, LogisticsSection, CTASection } from "@/components/HomeSections";
import { DealsSection, NewsletterSection } from "@/components/HomeExtras";
import DestinationsSection from "@/components/DestinationsSection";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

const Index = () => {
  const { hero, heroSlides } = useSiteContent();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if hero data is loaded
    if (hero || heroSlides.length > 0) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hero, heroSlides]);

  return (
    <>
      {isLoading && <Preloader />}
      <div className="min-h-screen bg-background scroll-smooth">
        <Header />
        <main>
          <section id="hero"><HeroSection /></section>
          <section id="services"><ServicesSection /></section>
          <section id="destinations"><DestinationsSection /></section>
          <section id="deals"><DealsSection /></section>
          <section id="work-permits"><WorkPermitsSection /></section>
          <section id="logistics"><LogisticsSection /></section>
          <section id="testimonials"><TestimonialsSection /></section>
          <section id="partners"><PartnersSection /></section>
          <section id="newsletter"><NewsletterSection /></section>
          <section id="cta"><CTASection /></section>
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default Index;
