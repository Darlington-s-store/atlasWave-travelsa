import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Upload, Stethoscope, BookOpen, Award, Briefcase, FileText } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const UsaNclex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    previousAttempt: "",
    notes: "",
    documents: {} as Record<string, string>
  });

  const requirements = [
    "Valid Passport",
    "Nursing Degree/Diploma",
    "Current Nursing License",
    "Academic Transcripts",
    "Proof of Identity",
    "Professional References",
  ];

  const handleFileUpload = (req: string, fileName: string) => {
    setForm(f => ({
      ...f,
      documents: {
        ...f.documents,
        [req]: fileName
      }
    }));
    toast({ title: "File Selected", description: `${fileName} attached for ${req}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to submit an application.", variant: "destructive" });
      return;
    }

    if (!form.firstName || !form.lastName || !form.email) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        title: "USA NCLEX Pathway",
        type: "USA NCLEX",
        status: "pending",
        details: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          qualification: form.qualification,
          experience: form.experience,
          previousAttempt: form.previousAttempt,
          notes: form.notes,
          documents: form.documents
        }),
        qualification: form.qualification,
        documents: form.documents
      });

      if (error) throw error;

      toast({ title: "Application Submitted", description: "Your NCLEX pathway application has been received." });
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
                        <Input placeholder="Jane" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
                        <Input placeholder="Doe" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                      <Input type="email" placeholder="jane@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                      <Input type="tel" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nursing Qualification</label>
                      <Select value={form.qualification} onValueChange={v => setForm(f => ({ ...f, qualification: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <Select value={form.experience} onValueChange={v => setForm(f => ({ ...f, experience: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <Select value={form.previousAttempt} onValueChange={v => setForm(f => ({ ...f, previousAttempt: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No, first attempt</SelectItem>
                          <SelectItem value="yes-pass">Yes, passed</SelectItem>
                          <SelectItem value="yes-fail">Yes, did not pass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                      <label className="text-sm font-medium text-foreground block">Required Credentials for NCLEX Pathway</label>
                      <div className="grid gap-3">
                        {requirements.map((req) => (
                          <div key={req} className="flex flex-col gap-2 p-4 rounded-xl border bg-muted/30">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2 text-left">
                                <FileText className="w-4 h-4 text-primary shrink-0" /> {req}
                              </span>
                              {form.documents[req] ? (
                                <Badge className="bg-secondary/20 text-secondary border-secondary/30">Selected</Badge>
                              ) : (
                                <Badge variant="outline">Missing</Badge>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(req, file.name);
                                }}
                              />
                              <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                                <Upload className="w-3 h-3 mr-2" /> {form.documents[req] || "Choose File"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label>
                      <Textarea 
                        placeholder="Tell us about your nursing background..." 
                        rows={3} 
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                    <Button variant="accent" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
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
