import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroLogistics from "@/assets/hero-logistics.jpg";

const countries = [
  { code: "DE", name: "Germany", programs: ["Work Permit", "Opportunity Card"] },
  { code: "CA", name: "Canada", programs: ["LMIA Work Permit"] },
  { code: "US", name: "USA", programs: ["NCLEX Pathway"] },
  { code: "NL", name: "Netherlands", programs: ["Work Permit"] },
  { code: "FR", name: "France", programs: ["Work Permit"] },
  { code: "IT", name: "Italy", programs: ["Work Permit"] },
];

const WorkPermitsSection = () => {
  return (
    <section className="bg-muted py-20 sm:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">Immigration Services</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
              Work Permits & <span className="text-gradient-accent">Immigration</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Navigate the complex world of international work permits with our expert team. From eligibility checks to document submission, we handle it all.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Eligibility assessment and points calculator",
                "Document preparation and verification",
                "Application submission and tracking",
                "Credential evaluation (ECA, CGFNS)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8 w-full sm:w-auto" asChild>
              <Link to="/work-permits">
                Explore Programs <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {countries.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover"
                >
                  <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                    {country.code}
                  </span>
                  <h4 className="mt-3 font-display font-semibold text-card-foreground">{country.name}</h4>
                  <div className="mt-2 space-y-1">
                    {country.programs.map((program) => (
                      <span key={program} className="block text-xs text-muted-foreground">
                        {program}
                      </span>
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
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl lg:order-1"
          >
            <img src={heroLogistics} alt="Cargo port with shipping containers" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="rounded-xl border bg-card/90 p-4 backdrop-blur-md">
                <p className="text-sm font-semibold text-card-foreground">Track your shipment</p>
                <p className="mt-1 text-xs text-muted-foreground">Enter your tracking ID to get real-time updates.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">Logistics Solutions</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
              Reliable Global <span className="text-gradient-accent">Shipping</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Air freight, sea cargo, road transport, and customs clearance with real-time tracking and dedicated support.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Air Freight", value: "Fast and secure" },
                { label: "Sea Cargo", value: "Cost-effective" },
                { label: "Road Transport", value: "Door-to-door" },
                { label: "Customs Clearance", value: "Hassle-free" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8 w-full sm:w-auto" asChild>
              <Link to="/logistics">
                Learn More <ArrowRight className="h-5 w-5" />
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
    <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/70 sm:text-lg">
            Whether it is a vacation, a work permit, or shipping cargo, our team is here to help.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/consultation">Book Free Consultation</Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { WorkPermitsSection, LogisticsSection, CTASection };
