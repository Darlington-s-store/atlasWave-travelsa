import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileCheck, CheckCircle2, ArrowRight, Globe, Clock, Shield } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const visaTypes = [
  { flag: "🇪🇺", name: "Schengen Tourist Visa", processing: "5-15 days", success: "98%", price: "$150" },
  { flag: "🇺🇸", name: "USA B1/B2 Visa", processing: "3-8 weeks", success: "92%", price: "$200" },
  { flag: "🇬🇧", name: "UK Standard Visitor Visa", processing: "3-6 weeks", success: "95%", price: "$180" },
  { flag: "🇨🇦", name: "Canada Tourist Visa", processing: "4-8 weeks", success: "94%", price: "$170" },
  { flag: "🇦🇪", name: "UAE Tourist Visa", processing: "3-5 days", success: "99%", price: "$100" },
  { flag: "🇦🇺", name: "Australia Visitor Visa", processing: "4-6 weeks", success: "90%", price: "$190" },
];

const steps = [
  { step: "01", title: "Free Consultation", desc: "We assess your eligibility and recommend the best visa type." },
  { step: "02", title: "Document Preparation", desc: "Our team helps you compile and review all required documents." },
  { step: "03", title: "Application Submission", desc: "We submit your application and track its progress in real-time." },
  { step: "04", title: "Visa Approved", desc: "Receive your visa and travel with confidence." },
];

const VisaAssistance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <FileCheck className="w-4 h-4 inline mr-2" />Visa Assistance
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Expert <span className="text-gradient-accent">Visa</span> Services
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl">
                95%+ approval rate across 50+ countries. We handle your visa from start to finish.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Visa Types */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Visa <span className="text-gradient-accent">Programs</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaTypes.map((v, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all">
                  <span className="text-3xl mb-3 block">{v.flag}</span>
                  <h3 className="font-display font-bold text-card-foreground mb-3">{v.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Processing</span>
                      <span className="text-foreground font-medium">{v.processing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Success Rate</span>
                      <span className="text-accent font-medium">{v.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground font-bold">{v.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-muted">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              How It <span className="text-gradient-accent">Works</span>
            </h2>
            <div className="space-y-6">
              {steps.map((s, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="flex gap-6 items-start">
                  <span className="text-3xl font-display font-bold text-accent/30">{s.step}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="accent" size="lg" asChild>
                <Link to="/consultation">Book Free Consultation <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VisaAssistance;
