import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, FileCheck, FileText, Globe, Hotel, Package, Plane, Ship, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteContent, getStorageUrl, type HeroSlideContent, type ServiceContent } from "@/hooks/useSiteContent";
import { useVideos, getEmbedUrl, getVideoStorageUrl } from "@/hooks/useVideos";
import heroTravel from "@/assets/hero-travel.jpg";

interface SlideData {
  image: string;
  badge: string;
  title: string;
  highlight: string;
  titleEnd: string;
  desc: string;
  cta: { label: string; link: string };
  ctaSecondary: { label: string; link: string };
}

function cmsSlideToSlide(slide: HeroSlideContent): SlideData {
  return {
    image: getStorageUrl(slide.image_url) || heroTravel,
    badge: slide.badge || "",
    title: slide.title || "",
    highlight: slide.highlight || "",
    titleEnd: slide.title_end || "",
    desc: slide.description || "",
    cta: { label: slide.cta_label || "Get Started", link: slide.cta_link || "/consultation" },
    ctaSecondary: {
      label: slide.cta_secondary_label || "Learn More",
      link: slide.cta_secondary_link || "/about",
    },
  };
}

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const { hero, heroSlides, services } = useSiteContent();
  const { videos: heroVideos } = useVideos("hero");
  const serviceIconMap = { Plane, Hotel, FileCheck, Briefcase, Globe, Ship, Truck, Package, FileText };

  const heroVideo = heroVideos.length > 0 ? heroVideos[0] : null;
  const heroVideoSrc = heroVideo?.video_type === "upload" ? getVideoStorageUrl(heroVideo.file_path) : null;
  const slides =
    heroSlides.length > 0
      ? heroSlides.map(cmsSlideToSlide)
      : hero
        ? [
            {
              image: heroTravel,
              badge: "AtlastWave Travel and Tour",
              title: hero.title || "",
              highlight: "",
              titleEnd: "",
              desc: hero.subtitle || "",
              cta: { label: hero.cta_text || "Get Started", link: hero.cta_link || "/consultation" },
              ctaSecondary: { label: "Learn More", link: "/about" },
            },
          ]
        : [];

  const quickLinks = services.slice(0, 3).map((service: ServiceContent) => {
    const Icon = serviceIconMap[service.icon as keyof typeof serviceIconMap] || FileText;
    return {
      icon: Icon,
      title: service.title,
      desc: service.description,
      link: service.link || "/consultation",
    };
  });

  const safeCurrent = slides.length > 0 ? current % slides.length : 0;
  const slide = slides[safeCurrent];

  // Fallback slide to show while loading
  const displaySlide = slide || {
    image: heroTravel,
    badge: "",
    title: "",
    highlight: "",
    titleEnd: "",
    desc: "",
    cta: { label: "Get Started", link: "/consultation" },
    ctaSecondary: { label: "Learn More", link: "/about" },
  };

  useEffect(() => {
    if (slides.length === 0) {
      return;
    }

    const timer = setInterval(() => setCurrent((previous) => (previous + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) {
      setCurrent(0);
      return;
    }

    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  const goTo = (direction: number) => {
    if (slides.length === 0) {
      return;
    }

    setCurrent((previous) => (previous + direction + slides.length) % slides.length);
  };

  return (
    <section className="relative flex min-h-screen min-h-[100svh] items-center overflow-hidden">
      {heroVideoSrc ? (
        <div className="absolute inset-0 z-[1]">
          <video src={heroVideoSrc} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        </div>
      ) : heroVideo?.video_type === "embed" && heroVideo.video_url ? (
        <div className="absolute inset-0 z-[1]">
          <iframe
            src={`${getEmbedUrl(heroVideo.video_url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            allow="autoplay; encrypted-media"
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
            style={{ border: 0 }}
          />
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={safeCurrent}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={displaySlide.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
          </motion.div>
        </AnimatePresence>
      )}

      <button
        onClick={() => goTo(-1)}
        className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm transition-colors hover:bg-primary-foreground/20 md:flex"
      >
        <ChevronLeft className="h-5 w-5 text-primary-foreground" />
      </button>
      <button
        onClick={() => goTo(1)}
        className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm transition-colors hover:bg-primary-foreground/20 md:flex"
      >
        <ChevronRight className="h-5 w-5 text-primary-foreground" />
      </button>

      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-24 lg:bottom-28">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === safeCurrent ? "w-8 bg-accent" : "w-2 bg-primary-foreground/30"}`}
          />
        ))}
      </div>

      <div className="container relative z-10 flex flex-col items-center pb-24 pt-28 text-center sm:pb-28 sm:pt-32">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeCurrent}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className="mb-6 font-display text-3xl font-bold leading-tight sm:mb-7 sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ color: "hsl(var(--primary-foreground))" }}
              >
                {displaySlide.title}{" "}
                <span className="text-gradient-accent">{displaySlide.highlight}</span>{" "}
                {displaySlide.titleEnd}
              </h1>

              <p
                className="mx-auto mb-8 max-w-2xl text-base leading-relaxed sm:mb-10 sm:text-lg"
                style={{ color: "hsl(var(--primary-foreground) / 0.8)" }}
              >
                {displaySlide.desc}
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                  <Link to={displaySlide.cta.link}>
                    {displaySlide.cta.label} <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link to={displaySlide.ctaSecondary.link}>{displaySlide.ctaSecondary.label}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
