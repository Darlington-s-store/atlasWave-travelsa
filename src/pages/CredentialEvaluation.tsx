import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileCheck, CheckCircle2, ArrowRight, GraduationCap, Clock, Globe } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const services = [
  { title: "WES Evaluation", desc: "World Education Services credential assessment for Canada and US immigration.", countries: "🇨🇦 🇺🇸", timeline: "4-6 weeks" },
  { title: "IQAS Assessment", desc: "International Qualifications Assessment Service for Alberta, Canada.", countries: "🇨🇦", timeline: "8-12 weeks" },
  { title: "NARIC/ENIC", desc: "European credential recognition for Schengen country work permits.", countries: "🇪🇺", timeline: "4-8 weeks" },
  { title: "Nursing Board Evaluation", desc: "CGFNS and state board evaluations for nursing professionals.", countries: "🇺🇸", timeline: "6-10 weeks" },
  { title: "ECE Evaluation", desc: "Educational Credential Evaluators for US academic and professional use.", countries: "🇺🇸", timeline: "5-7 weeks" },
  { title: "German Anabin Check", desc: "Verify your degree recognition status in the German Anabin database.", countries: "🇩🇪", timeline: "2-4 weeks" },
];

const steps = [
  "Submit your academic transcripts and certificates",
  "We verify and translate documents as needed",
  "Application submitted to the relevant evaluation body",
  "Receive your credential evaluation report",
];

const CredentialEvaluation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <GraduationCap className="w-4 h-4 inline mr-2" />Credential Evaluation
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Credential <span className="text-gradient-accent">Evaluation</span> Services
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl">
                Get your qualifications recognized internationally for work permits, immigration, and professional licensing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Evaluation <span className="text-gradient-accent">Services</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all">
                  <h3 className="font-display font-bold text-card-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                  <div className="flex justify-between text-sm">
                    <span>{s.countries}</span>
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{s.timeline}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-muted">
          <div className="container max-w-2xl">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              The <span className="text-gradient-accent">Process</span>
            </h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground pt-1">{step}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="accent" size="lg" asChild>
                <Link to="/consultation">Start Evaluation <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CredentialEvaluation;
