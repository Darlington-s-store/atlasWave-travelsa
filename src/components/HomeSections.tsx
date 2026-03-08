import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroLogistics from "@/assets/hero-logistics.jpg";

const countries = [
  { flag: "🇩🇪", name: "Germany", programs: ["Work Permit", "Opportunity Card"] },
  { flag: "🇨🇦", name: "Canada", programs: ["LMIA Work Permit"] },
  { flag: "🇺🇸", name: "USA", programs: ["NCLEX Pathway"] },
  { flag: "🇳🇱", name: "Netherlands", programs: ["Work Permit"] },
  { flag: "🇫🇷", name: "France", programs: ["Work Permit"] },
  { flag: "🇮🇹", name: "Italy", programs: ["Work Permit"] },
];

const WorkPermitsSection = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">Immigration Services</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
              Work Permits & <span className="text-gradient-accent">Immigration</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Navigate the complex world of international work permits with our expert team. From eligibility checks to document submission — we handle it all.
            </p>

            <div className="mt-8 space-y-3">
              {["Eligibility assessment & points calculator", "Document preparation & verification", "Application submission & tracking", "Credential evaluation (ECA, CGFNS)"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link to="/work-permits">
                Explore Programs <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-4">
              {countries.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-5 border shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <span className="text-3xl">{c.flag}</span>
                  <h4 className="font-display font-semibold text-card-foreground mt-2">{c.name}</h4>
                  <div className="mt-2 space-y-1">
                    {c.programs.map((p) => (
                      <span key={p} className="block text-xs text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const LogisticsSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] order-2 lg:order-1"
          >
            <img src={heroLogistics} alt="Cargo port with shipping containers" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 border">
                <p className="text-sm font-semibold text-card-foreground">📦 Track your shipment</p>
                <p className="text-xs text-muted-foreground mt-1">Enter your tracking ID to get real-time updates</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">Logistics Solutions</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
              Reliable Global <span className="text-gradient-accent">Shipping</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Air freight, sea cargo, road transport, and customs clearance — all with real-time tracking and dedicated support.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: "Air Freight", value: "Fast & secure" },
                { label: "Sea Cargo", value: "Cost-effective" },
                { label: "Road Transport", value: "Door-to-door" },
                { label: "Customs Clearance", value: "Hassle-free" },
              ].map((item) => (
                <div key={item.label} className="bg-muted rounded-lg p-4">
                  <p className="font-semibold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link to="/logistics">
                Learn More <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-xl mx-auto">
            Whether it's a vacation, a work permit, or shipping cargo — our team is here to help 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button variant="hero" size="lg" asChild>
              <Link to="/consultation">Book Free Consultation</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { WorkPermitsSection, LogisticsSection, CTASection };
