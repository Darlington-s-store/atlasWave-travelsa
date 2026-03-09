import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle2, Upload, Calculator } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const pointsCriteria = [
  { category: "Qualifications", options: [{ label: "Vocational training", points: 1 }, { label: "Bachelor's degree", points: 3 }, { label: "Master's/PhD", points: 4 }] },
  { category: "Work Experience", options: [{ label: "2 years", points: 1 }, { label: "3–5 years", points: 2 }, { label: "5+ years", points: 3 }] },
  { category: "German Language", options: [{ label: "A1–A2", points: 1 }, { label: "B1–B2", points: 3 }, { label: "C1–C2", points: 4 }] },
  { category: "Age", options: [{ label: "Under 35", points: 2 }, { label: "35–40", points: 1 }, { label: "Over 40", points: 0 }] },
];

const GermanyChancenkarte = () => {
  const [selections, setSelections] = useState<Record<string, number>>({});
  const totalPoints = Object.values(selections).reduce((sum, p) => sum + p, 0);
  const eligible = totalPoints >= 6;

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
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">🇩🇪 Germany</span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Germany <span className="text-gradient-accent">Opportunity Card</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                The Chancenkarte is Germany's points-based immigration pathway for skilled workers seeking employment opportunities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Points Calculator */}
        <section className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Calculator className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Points Calculator</h2>
                    <p className="text-sm text-muted-foreground">You need at least 6 points to qualify</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {pointsCriteria.map((criteria) => (
                    <div key={criteria.category}>
                      <label className="text-sm font-semibold text-foreground mb-2 block">{criteria.category}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {criteria.options.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => setSelections((prev) => ({ ...prev, [criteria.category]: opt.points }))}
                            className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                              selections[criteria.category] === opt.points
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-card-foreground border-border hover:border-secondary"
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className="block text-xs opacity-70 mt-0.5">{opt.points} point{opt.points !== 1 ? "s" : ""}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Result */}
                <div className={`mt-8 rounded-2xl p-6 border ${eligible ? "bg-secondary/10 border-secondary" : "bg-muted border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Your Score</p>
                      <p className="text-4xl font-display font-bold mt-1" style={{ color: eligible ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))" }}>
                        {totalPoints} / 6
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${eligible ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {eligible ? "✓ Eligible" : "More points needed"}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-2">Requirements</h3>
                  <p className="text-sm text-muted-foreground mb-6">To qualify for the Opportunity Card:</p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Recognized foreign qualification or German equivalent",
                      "At least 6 points from the criteria",
                      "German language skills (minimum A1) or English (B2)",
                      "Proof of financial self-sufficiency",
                      "No criminal record",
                      "Valid health insurance",
                    ].map((req) => (
                      <div key={req} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-foreground text-sm">{req}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-display text-lg font-bold text-card-foreground mb-4">Apply Now</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label><Input placeholder="John" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" placeholder="john@example.com" /></div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">German Level</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="a1">A1</SelectItem>
                          <SelectItem value="a2">A2</SelectItem>
                          <SelectItem value="b1">B1</SelectItem>
                          <SelectItem value="b2">B2</SelectItem>
                          <SelectItem value="c1">C1+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><label className="text-sm font-medium text-foreground mb-1.5 block">Upload Documents</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Upload CV & certificates</p>
                      </div>
                    </div>
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

export default GermanyChancenkarte;
