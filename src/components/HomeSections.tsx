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
    <section className="bg-muted/50 py-20 sm:py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent/70">Work Abroad</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl lg:text-5xl">
              Secure your <span className="text-accent">work permit</span><br /> worldwide
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Our experts guide you through visa applications, eligibility assessments, and credential evaluations for Germany, Canada, USA, and more.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "LMIA & Canada Work Permits",
                "Germany Chancenkarte & Opportunity Card",
                "Credential Evaluation Services",
                "Document & Application Support",
              ].map((item, i) => (
                <div key={item} className="flex gap-3">
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-foreground/90">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link to="/work-permits">
                Explore Permits <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-5"
          >
            {countries.slice(0, 6).map((country, index) => (
              <motion.div
                key={country.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border p-5 transition-all hover:border-accent/50 ${
                  index === 1 ? "col-span-2 border-accent/40 bg-accent/8" : "bg-card/60 border-card"
                }`}
              >
                <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
                  {country.code}
                </span>
                <h4 className="mt-2 font-display font-semibold text-foreground">{country.name}</h4>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {country.programs.map((program) => (
                    <span key={program} className="text-xs text-muted-foreground">
                      • {program}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
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
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent/70">Shipping & Freight</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
              Global shipping made <span className="text-accent">simple</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Air, sea, or road – we handle your cargo with care. Track your shipments in real-time and get dedicated support every step of the way.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2">
              {[
                { label: "Air Freight", value: "Fast & Reliable" },
                { label: "Sea Cargo", value: "Cost Effective" },
                { label: "Ground Transport", value: "Door-to-Door" },
                { label: "Customs", value: "Hassle-Free" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-card bg-card/30 p-4 hover:border-accent/30 transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent/70">{item.label}</p>
                  <p className="mt-1 font-display text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link to="/logistics">
                Start Shipping <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-xl"
          >
            <img src={heroLogistics} alt="Global shipping and cargo services" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">Track your shipment in real-time</p>
                <p className="mt-1.5 text-xs text-white/75">Get updates at every stop, everywhere in the world.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute right--20 top-20 h-96 w-96 rounded-full bg-accent blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent blur-[80px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
            Let's make your dreams happen
          </h2>
          <p className="mt-6 text-base text-primary-foreground/70 sm:text-lg">
            Whether you're traveling for leisure, work, or business – our team is ready to support you every step of the way.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/consultation">
                Book a Chat <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { WorkPermitsSection, LogisticsSection, CTASection };
