import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Plane, Package, FileText } from "lucide-react";
import heroTravel from "@/assets/hero-travel.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroTravel} alt="Beautiful tropical coastline" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
      </div>

      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 backdrop-blur-sm border border-accent/30">
              Travel • Immigration • Logistics
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6"
            style={{ color: "hsl(var(--primary-foreground))" }}
          >
            Your Gateway to{" "}
            <span className="text-gradient-accent">Global</span>{" "}
            Opportunities
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
            style={{ color: "hsl(var(--primary-foreground) / 0.75)" }}
          >
            From dream vacations to work permits, visa processing, and seamless logistics — we make global travel and immigration effortless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/work-permits">
                Apply for Work Permit <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/consultation">Book Consultation</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap gap-8 mt-16 pt-8 border-t"
            style={{ borderColor: "hsl(var(--primary-foreground) / 0.15)" }}
          >
            {[
              { value: "15K+", label: "Visas Processed" },
              { value: "50+", label: "Countries Served" },
              { value: "98%", label: "Success Rate" },
              { value: "24/7", label: "Support Available" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-display font-bold text-accent">{stat.value}</div>
                <div className="text-sm" style={{ color: "hsl(var(--primary-foreground) / 0.6)" }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="absolute bottom-0 left-0 right-0 z-10 hidden lg:block">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 -mb-20">
            {[
              { icon: Plane, title: "Travel & Tours", desc: "Flights, hotels, and custom packages", link: "/travel" },
              { icon: FileText, title: "Work Permits", desc: "Immigration & visa processing", link: "/work-permits" },
              { icon: Package, title: "Logistics", desc: "Cargo shipping & tracking", link: "/logistics" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              >
                <Link
                  to={card.link}
                  className="flex items-center gap-4 bg-card rounded-xl p-6 shadow-card-hover hover:shadow-accent/20 transition-all duration-300 group border"
                >
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
