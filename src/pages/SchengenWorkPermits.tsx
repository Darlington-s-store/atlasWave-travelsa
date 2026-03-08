import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Clock, Upload } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const countries = [
  { flag: "🇩🇪", name: "Germany", requirements: ["Valid passport", "Job offer or contract", "Recognized qualifications", "Health insurance", "Proof of accommodation"] },
  { flag: "🇳🇱", name: "Netherlands", requirements: ["Valid passport", "Employment contract", "MVV visa", "TB test certificate", "Proof of income"] },
  { flag: "🇫🇷", name: "France", requirements: ["Valid passport", "Work contract validated by DIRECCTE", "Long-stay visa", "Medical certificate", "Proof of housing"] },
  { flag: "🇮🇹", name: "Italy", requirements: ["Valid passport", "Nulla Osta authorization", "Employment contract", "Proof of accommodation", "Health insurance"] },
  { flag: "🇵🇱", name: "Poland", requirements: ["Valid passport", "Work permit (Type A/B/C)", "Employment contract", "Health insurance", "Criminal record check"] },
];

const SchengenWorkPermits = () => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">🇪🇺 Schengen Zone</span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Schengen <span className="text-gradient-accent">Work Permits</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Work legally in Germany, Netherlands, France, Italy, and Poland with our expert permit processing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Country selector */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Choose Your Country</h2>
              <p className="text-muted-foreground mt-3">Select a Schengen country to view specific requirements.</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {countries.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCountry(c)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-medium ${
                    selectedCountry.name === c.name ? "bg-primary text-primary-foreground border-primary shadow-card" : "bg-card text-card-foreground border-border hover:border-secondary"
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span> {c.name}
                </button>
              ))}
            </div>

            <motion.div key={selectedCountry.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-12">
              <div className="bg-card rounded-2xl p-8 border shadow-card">
                <h3 className="font-display text-xl font-bold text-card-foreground mb-2">{selectedCountry.flag} {selectedCountry.name} — Requirements</h3>
                <p className="text-sm text-muted-foreground mb-6">Documents needed for a work permit application</p>
                <div className="space-y-3">
                  {selectedCountry.requirements.map((req) => (
                    <div key={req} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-foreground">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 border shadow-card">
                <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Process Timeline</h3>
                <p className="text-sm text-muted-foreground mb-6">Typical processing timeline</p>
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Consultation & Eligibility", time: "1–2 days" },
                    { step: "2", title: "Document Preparation", time: "1–2 weeks" },
                    { step: "3", title: "Application Submission", time: "1 day" },
                    { step: "4", title: "Processing & Review", time: "4–12 weeks" },
                    { step: "5", title: "Visa Issuance", time: "1–2 weeks" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-display font-bold text-accent">{item.step}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground">{item.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3" /> {item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-24 bg-muted">
          <div className="container max-w-2xl">
            <motion.div {...fadeUp}>
              <div className="bg-card rounded-2xl p-8 md:p-10 border shadow-card">
                <h2 className="text-2xl font-display font-bold text-card-foreground mb-2">Eligibility Check & Application</h2>
                <p className="text-muted-foreground mb-8">Fill in your details and we'll assess your eligibility.</p>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label><Input placeholder="John" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" placeholder="john@example.com" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label><Input type="tel" placeholder="+233 XX XXX XXXX" /></div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Target Country</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Highest Qualification</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highschool">High School</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm font-medium text-foreground mb-1.5 block">Additional Information</label><Textarea placeholder="Tell us about your work experience and goals..." rows={4} /></div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Upload Documents</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Drag & drop or click to upload (PDF, JPG, PNG)</p>
                    </div>
                  </div>
                  <Button variant="accent" size="lg" className="w-full">Submit Application <ArrowRight className="w-5 h-5" /></Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SchengenWorkPermits;
