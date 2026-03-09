import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Plane, Package, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent, getStorageUrl, type HeroSlideContent } from "@/hooks/useSiteContent";
import { useVideos, getVideoStorageUrl, getEmbedUrl } from "@/hooks/useVideos";
import heroTravel from "@/assets/hero-travel.jpg";
import heroLogistics from "@/assets/hero-logistics.jpg";

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

const defaultSlides: SlideData[] = [
  {
    image: heroTravel,
    badge: "Travel & Tours",
    title: "Your Gateway to",
    highlight: "Global",
    titleEnd: "Opportunities",
    desc: "From dream vacations to work permits, visa processing, and seamless logistics — we make global travel and immigration effortless.",
    cta: { label: "Book a Flight", link: "/travel/flights" },
    ctaSecondary: { label: "Explore Destinations", link: "/travel" },
  },
  {
    image: heroLogistics,
    badge: "Logistics & Shipping",
    title: "Reliable",
    highlight: "Cargo",
    titleEnd: "Worldwide",
    desc: "Air freight, sea cargo, road transport, and customs clearance — all with real-time tracking across 50+ countries.",
    cta: { label: "Track Shipment", link: "/logistics/tracking" },
    ctaSecondary: { label: "Get a Quote", link: "/consultation" },
  },
  {
    image: heroTravel,
    badge: "Immigration Services",
    title: "Secure Your",
    highlight: "Work Permit",
    titleEnd: "Today",
    desc: "Expert guidance for Schengen, Canada LMIA, Germany Opportunity Card, and USA NCLEX pathways with 98% success rate.",
    cta: { label: "Apply Now", link: "/work-permits" },
    ctaSecondary: { label: "Check Eligibility", link: "/work-permits/germany-chancenkarte" },
  },
];

function cmsSlideToSlide(s: HeroSlideContent): SlideData {
  return {
    image: getStorageUrl(s.image_url) || heroTravel,
    badge: s.badge || "",
    title: s.title || "",
    highlight: s.highlight || "",
    titleEnd: s.title_end || "",
    desc: s.description || "",
    cta: { label: s.cta_label || "Get Started", link: s.cta_link || "/consultation" },
    ctaSecondary: { label: s.cta_secondary_label || "Learn More", link: s.cta_secondary_link || "/about" },
  };
}

function useCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { count, ref };
}

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const { heroSlides } = useSiteContent();
  const { videos: heroVideos } = useVideos("hero");

  // Get the first hero video if available
  const heroVideo = heroVideos.length > 0 ? heroVideos[0] : null;
  const heroVideoSrc = heroVideo?.video_type === "upload"
    ? getVideoStorageUrl(heroVideo.file_path)
    : null;

  

  // Use CMS slides if available, otherwise defaults
  const slides: SlideData[] = heroSlides.length > 0
    ? heroSlides.map(cmsSlideToSlide)
    : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  const goTo = (dir: number) => {
    setCurrent((p) => (p + dir + slides.length) % slides.length);
  };

  const stat1 = useCounter(15000, 2000, 0);
  const stat2 = useCounter(50, 1500, 0);
  const stat3 = useCounter(98, 1800, 0);
  const stats = [
    { ...stat1, suffix: "+", label: "Visas Processed", format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n) },
    { ...stat2, suffix: "+", label: "Countries Served", format: (n: number) => String(n) },
    { ...stat3, suffix: "%", label: "Success Rate", format: (n: number) => String(n) },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background video (persistent across all slides) */}
      {heroVideoSrc ? (
        <div className="absolute inset-0 z-[1]">
          <video
            src={heroVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        </div>
      ) : heroVideo?.video_type === "embed" && heroVideo.video_url ? (
        <div className="absolute inset-0 z-[1]">
          <iframe
            src={`${getEmbedUrl(heroVideo.video_url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            allow="autoplay; encrypted-media"
            className="absolute w-[120%] h-[120%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ border: 0 }}
          />
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
          </motion.div>
        </AnimatePresence>
      )}

      <button onClick={() => goTo(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors hidden md:flex">
        <ChevronLeft className="w-5 h-5 text-primary-foreground" />
      </button>
      <button onClick={() => goTo(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors hidden md:flex">
        <ChevronRight className="w-5 h-5 text-primary-foreground" />
      </button>

      <div className="absolute bottom-32 lg:bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-accent" : "w-2 bg-primary-foreground/30"}`} />
        ))}
      </div>

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 backdrop-blur-sm border border-accent/30">
                {slide.badge}
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6" style={{ color: "hsl(var(--primary-foreground))" }}>
                {slide.title}{" "}<span className="text-gradient-accent">{slide.highlight}</span>{" "}{slide.titleEnd}
              </h1>

              <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl" style={{ color: "hsl(var(--primary-foreground) / 0.75)" }}>
                {slide.desc}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to={slide.cta.link}>{slide.cta.label} <ArrowRight className="w-5 h-5" /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to={slide.ctaSecondary.link}>{slide.ctaSecondary.label}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t" style={{ borderColor: "hsl(var(--primary-foreground) / 0.15)" }}>
            {stats.map((stat) => (
              <div key={stat.label} ref={stat.ref}>
                <div className="text-2xl md:text-3xl font-display font-bold text-accent">
                  {stat.format(stat.count)}{stat.suffix}
                </div>
                <div className="text-sm" style={{ color: "hsl(var(--primary-foreground) / 0.6)" }}>{stat.label}</div>
              </div>
            ))}
            <div>
              <div className="text-2xl md:text-3xl font-display font-bold text-accent">24/7</div>
              <div className="text-sm" style={{ color: "hsl(var(--primary-foreground) / 0.6)" }}>Support Available</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 hidden lg:block">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 -mb-20">
            {[
              { icon: Plane, title: "Travel & Tours", desc: "Flights, hotels, and custom packages", link: "/travel" },
              { icon: FileText, title: "Work Permits", desc: "Immigration & visa processing", link: "/work-permits" },
              { icon: Package, title: "Logistics", desc: "Cargo shipping & tracking", link: "/logistics" },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}>
                <Link to={card.link} className="flex items-center gap-4 bg-card rounded-xl p-6 shadow-card-hover hover:shadow-accent/20 transition-all duration-300 group border">
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <card.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-card-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-accent transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
