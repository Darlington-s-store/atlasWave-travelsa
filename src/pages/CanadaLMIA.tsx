import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Clock, Upload, FileText, Users, Briefcase } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const CanadaLMIA = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px]" />
          </div>
          <div className="container relative z-10 text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">🇨🇦 Canada</span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Canada <span className="text-gradient-accent">LMIA</span> Work Permit
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Navigate the Labour Market Impact Assessment process for Canadian employment with our expert guidance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What is LMIA */}
        <section className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div {...fadeUp}>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">What is LMIA?</h2>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  A Labour Market Impact Assessment (LMIA) is a document that a Canadian employer may need before hiring a foreign worker. A positive LMIA shows that there is a need for a foreign worker and that no Canadian worker is available for the job.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: FileText, title: "LMIA Application", desc: "Employer applies to ESDC" },
                    { icon: Users, title: "Worker Selection", desc: "Employer selects foreign worker" },
                    { icon: Briefcase, title: "Work Permit", desc: "Worker applies with positive LMIA" },
                  ].map((item) => (
                    <div key={item.title} className="bg-muted rounded-xl p-5 text-center">
                      <item.icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Step-by-Step Process</h3>
                  <div className="space-y-6 mt-6">
                    {[
                      { step: "1", title: "Employer Files LMIA", desc: "Canadian employer submits LMIA application to ESDC.", time: "1–3 months" },
                      { step: "2", title: "LMIA Approved", desc: "Positive LMIA confirms need for foreign worker.", time: "2–4 weeks" },
                      { step: "3", title: "Job Offer Issued", desc: "Employer issues formal job offer to the worker.", time: "1 week" },
                      { step: "4", title: "Work Permit Application", desc: "Worker applies for work permit at Canadian embassy.", time: "4–8 weeks" },
                      { step: "5", title: "Arrival in Canada", desc: "Worker enters Canada and begins employment.", time: "—" },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-display font-bold text-accent">{item.step}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-card-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3" /> {item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Requirements & Form */}
        <section className="py-24 bg-muted">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div {...fadeUp}>
                <h3 className="text-2xl font-display font-bold text-foreground mb-6">Requirements</h3>
                <div className="space-y-3">
                  {[
                    "Valid passport (6+ months validity)",
                    "Positive LMIA from Canadian employer",
                    "Job offer letter",
                    "Proof of qualifications & work experience",
                    "Language proficiency (English or French)",
                    "Medical examination",
                    "Police clearance certificate",
                    "Proof of financial support",
                  ].map((req) => (
                    <div key={req} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-foreground">{req}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-6">Apply Now</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label><Input placeholder="John" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" placeholder="john@example.com" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label><Input type="tel" placeholder="+233 XX XXX XXXX" /></div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Do you have a Canadian employer?</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No, I need help finding one</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Upload CV</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Upload your CV (PDF, DOC)</p>
                      </div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label><Textarea placeholder="Tell us about your experience..." rows={3} /></div>
                    <Button variant="accent" size="lg" className="w-full">Submit Application <ArrowRight className="w-5 h-5" /></Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CanadaLMIA;
