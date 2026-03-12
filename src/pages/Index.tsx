import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import BackToTop from "@/components/BackToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WorkPermitsSection, LogisticsSection, CTASection } from "@/components/HomeSections";
import { DealsSection, NewsletterSection } from "@/components/HomeExtras";

const Index = () => {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      <main>
        <section id="hero"><HeroSection /></section>
        <section id="services"><ServicesSection /></section>
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
  );
};

export default Index;
