import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileCheck, Globe, CheckCircle2 } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const programs = [
  {
    flag: "🇪🇺",
    title: "Schengen Work Permits",
    countries: "Germany, Netherlands, France, Italy, Poland",
    desc: "Access work opportunities across Schengen member states with our comprehensive permit processing services.",
    link: "/work-permits/schengen",
  },
  {
    flag: "🇨🇦",
    title: "Canada – LMIA Work Permit",
    countries: "All Canadian Provinces",
    desc: "Navigate the Labour Market Impact Assessment process for Canadian employment with expert guidance.",
    link: "/work-permits/canada-lmia",
  },
  {
    flag: "🇩🇪",
    title: "Germany – Opportunity Card",
    countries: "Chancenkarte Program",
    desc: "Leverage Germany's points-based Opportunity Card to find employment in Europe's largest economy.",
    link: "/work-permits/germany-chancenkarte",
  },
  {
    flag: "🇺🇸",
    title: "USA – NCLEX Pathway",
    countries: "All US States",
    desc: "Specialized pathway for nurses seeking to practice in the United States through the NCLEX program.",
    link: "/work-permits/usa-nclex",
  },
];

const WorkPermits = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                Immigration Services
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Work Permits & <span className="text-gradient-accent">Immigration</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Expert guidance through every step of the work permit and immigration process. From eligibility checks to document submission.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Programs */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Our Immigration Programs</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Choose your destination — we'll handle the rest.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {programs.map((program, i) => (
                <motion.div
                  key={program.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={program.link}
                    className="group block bg-card rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all duration-300 h-full"
                  >
                    <div className="flex items-start gap-5">
                      <span className="text-5xl">{program.flag}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-bold text-card-foreground group-hover:text-secondary transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-sm font-medium text-secondary mt-1">{program.countries}</p>
                        <p className="text-muted-foreground mt-3 leading-relaxed">{program.desc}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent mt-4 group-hover:gap-3 transition-all">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Credential Evaluation */}
        <section className="py-24 bg-muted">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeUp}>
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <FileCheck className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Credential Evaluation</h2>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  Get your educational and professional credentials evaluated for international recognition.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Educational Credential Assessment (ECA)",
                    "Nursing credential verification (CGFNS-type)",
                    "Transcripts & qualification reviews",
                    "Certificate upload & status tracking",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="accent" size="lg" className="mt-8" asChild>
                  <Link to="/consultation">Start Evaluation <ArrowRight className="w-5 h-5" /></Link>
                </Button>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-6">How It Works</h3>
                  <div className="space-y-6">
                    {[
                      { step: "1", title: "Submit Documents", desc: "Upload your certificates, transcripts, and qualifications." },
                      { step: "2", title: "Expert Review", desc: "Our team reviews and verifies your credentials." },
                      { step: "3", title: "Evaluation Report", desc: "Receive your official evaluation report." },
                      { step: "4", title: "Application Support", desc: "We help you use the report in your visa or work permit application." },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-display font-bold text-accent">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Our Process</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Simple, transparent, and efficient.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Globe, title: "Free Consultation", desc: "Discuss your goals and options" },
                { icon: FileCheck, title: "Eligibility Check", desc: "Assess your qualifications" },
                { icon: Briefcase, title: "Document Prep", desc: "Prepare & submit your application" },
                { icon: CheckCircle2, title: "Approval", desc: "Receive your work permit" },
              ].map((step, i) => (
                <motion.div key={step.title} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary">
          <div className="container text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                Ready to Start Your Immigration Journey?
              </h2>
              <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg">
                Book a free consultation with our immigration experts today.
              </p>
              <Button variant="hero" size="lg" className="mt-8" asChild>
                <Link to="/consultation">Book Free Consultation <ArrowRight className="w-5 h-5" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorkPermits;
