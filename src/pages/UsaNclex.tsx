import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Upload, Stethoscope, BookOpen, Award, Briefcase } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const UsaNclex = () => {
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
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">🇺🇸 United States</span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                USA <span className="text-gradient-accent">NCLEX</span> Pathway
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                A specialized pathway for nurses seeking to practice in the United States through the NCLEX examination program.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pathway Steps */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Your Pathway to the USA</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
                From exam preparation to job placement, we guide you through every step.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, title: "NCLEX Exam Guidance", desc: "Comprehensive preparation materials, practice tests, and coaching to pass the NCLEX-RN examination." },
                { icon: Award, title: "Credential Evaluation", desc: "CGFNS credential evaluation and VisaScreen certificate processing for international nurses." },
                { icon: Stethoscope, title: "State Licensing", desc: "Navigate state-specific nursing board requirements and obtain your RN license." },
                { icon: Briefcase, title: "Job Placement", desc: "Connect with US healthcare employers actively recruiting international nurses." },
              ].map((step, i) => (
                <motion.div key={step.title} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-6 border shadow-card text-center">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="font-display font-bold text-card-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Details & Form */}
        <section className="py-24 bg-muted">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div {...fadeUp}>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">What We Provide</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-3">NCLEX Preparation</h3>
                    <div className="space-y-2">
                      {["Study materials & question banks", "Timed practice examinations", "One-on-one tutoring sessions", "Pass guarantee program"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-3">Credential Evaluation</h3>
                    <div className="space-y-2">
                      {["CGFNS Certification Program", "VisaScreen Certificate", "Credentials Evaluation Service", "English proficiency test support (IELTS/TOEFL)"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-3">Job Placement Support</h3>
                    <div className="space-y-2">
                      {["Resume & cover letter preparation", "Interview coaching", "Hospital & facility matching", "Visa sponsorship coordination (EB-3, H-1B)"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Start Your NCLEX Journey</h3>
                  <p className="text-sm text-muted-foreground mb-6">Fill out the form and our nursing immigration specialist will contact you.</p>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label><Input placeholder="Jane" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" placeholder="jane@example.com" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label><Input type="tel" placeholder="+233 XX XXX XXXX" /></div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nursing Qualification</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rn">Registered Nurse (RN)</SelectItem>
                          <SelectItem value="bsn">Bachelor of Science in Nursing (BSN)</SelectItem>
                          <SelectItem value="msn">Master of Science in Nursing (MSN)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Years of Nursing Experience</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1–2 years</SelectItem>
                          <SelectItem value="3-5">3–5 years</SelectItem>
                          <SelectItem value="5-10">5–10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Have you taken NCLEX before?</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No, first attempt</SelectItem>
                          <SelectItem value="yes-pass">Yes, passed</SelectItem>
                          <SelectItem value="yes-fail">Yes, did not pass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Upload Nursing Certificate</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Upload certificate (PDF, JPG)</p>
                      </div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label><Textarea placeholder="Tell us about your nursing background..." rows={3} /></div>
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

export default UsaNclex;
