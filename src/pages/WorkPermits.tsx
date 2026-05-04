import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  ArrowRight, Briefcase, FileCheck, Globe, CheckCircle2, XCircle, GraduationCap,
  Users, Award, Languages, Calculator, ChevronRight, Clock, Shield, MessageCircle,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const programs = [
  { flag: "🇪🇺", title: "Schengen Work Permits", countries: "Germany, Netherlands, France, Italy, Poland", desc: "Access work opportunities across Schengen member states.", link: "/work-permits/schengen" },
  { flag: "🇨🇦", title: "Canada – LMIA Work Permit", countries: "All Canadian Provinces", desc: "Navigate the Labour Market Impact Assessment process.", link: "/work-permits/canada-lmia" },
  { flag: "🇩🇪", title: "Germany – Opportunity Card", countries: "Chancenkarte Program", desc: "Leverage Germany's points-based Opportunity Card.", link: "/work-permits/germany-chancenkarte" },
  { flag: "🇺🇸", title: "USA – NCLEX Pathway", countries: "All US States", desc: "Specialized pathway for nurses via the NCLEX program.", link: "/work-permits/usa-nclex" },
];

const comparisonData = [
  { feature: "Processing Time", schengen: "6-12 weeks", canada: "8-16 weeks", germany: "4-8 weeks", usa: "12-24 weeks" },
  { feature: "Min. Education", schengen: "Vocational", canada: "High School", germany: "Bachelor's", usa: "Nursing Degree" },
  { feature: "Language Required", schengen: "Varies", canada: "English/French", germany: "B1 German or B2 English", usa: "English (TOEFL/IELTS)" },
  { feature: "Work Experience", schengen: "2+ years", canada: "1+ years", germany: "3+ years", usa: "Nursing license" },
  { feature: "Points System", schengen: "No", canada: "Yes (CRS)", germany: "Yes (6 pts min)", usa: "No" },
  { feature: "Age Limit", schengen: "None", canada: "None (pts favor <35)", germany: "Under 35 preferred", usa: "None" },
  { feature: "Employer Needed", schengen: "Yes", canada: "Yes (LMIA)", germany: "No (job search)", usa: "Yes" },
  { feature: "Family Included", schengen: "Yes", canada: "Yes", germany: "Yes", usa: "Yes" },
  { feature: "Path to PR", schengen: "Varies", canada: "Yes", germany: "Yes", usa: "Yes (EB-3)" },
  { feature: "Service Fee", schengen: "From $300", canada: "From $450", germany: "From $350", usa: "From $500" },
];

const professions = [
  "Software Engineer", "Nurse / Healthcare", "Mechanical Engineer", "Electrician", "Plumber",
  "Teacher / Educator", "Accountant", "Chef / Hospitality", "Construction Worker", "Logistics Manager",
  "Data Analyst", "Doctor / Physician", "Pharmacist", "Welder", "Agricultural Worker", "Other",
];

const educationLevels = [
  { value: "high-school", label: "High School Diploma", points: 1 },
  { value: "vocational", label: "Vocational / Trade Certificate", points: 2 },
  { value: "bachelors", label: "Bachelor's Degree", points: 3 },
  { value: "masters", label: "Master's Degree", points: 4 },
  { value: "phd", label: "PhD / Doctorate", points: 4 },
];

const languageLevels = [
  { value: "none", label: "None", points: 0 },
  { value: "a1-a2", label: "Basic (A1-A2)", points: 1 },
  { value: "b1", label: "Intermediate (B1)", points: 2 },
  { value: "b2", label: "Upper Intermediate (B2)", points: 3 },
  { value: "c1-c2", label: "Advanced (C1-C2)", points: 4 },
];

const experienceOptions = [
  { value: "0-1", label: "0-1 years", points: 0 },
  { value: "2-3", label: "2-3 years", points: 1 },
  { value: "4-5", label: "4-5 years", points: 2 },
  { value: "6-10", label: "6-10 years", points: 3 },
  { value: "10+", label: "10+ years", points: 4 },
];

const ageRanges = [
  { value: "18-25", label: "18-25", points: 2 },
  { value: "26-30", label: "26-30", points: 3 },
  { value: "31-35", label: "31-35", points: 3 },
  { value: "36-40", label: "36-40", points: 2 },
  { value: "41-45", label: "41-45", points: 1 },
  { value: "46+", label: "46+", points: 0 },
];

const processSteps = [
  { num: "01", title: "Free Consultation", desc: "Discuss your goals, eligibility, and best pathways.", icon: MessageCircle, color: "bg-secondary/10 text-secondary" },
  { num: "02", title: "Eligibility Assessment", desc: "We evaluate your qualifications, experience, and language skills.", icon: Calculator, color: "bg-accent/10 text-accent-foreground" },
  { num: "03", title: "Document Preparation", desc: "Compile, translate, and verify all required documents.", icon: FileCheck, color: "bg-primary/10 text-primary" },
  { num: "04", title: "Application Submission", desc: "Submit your application to the relevant immigration authority.", icon: Globe, color: "bg-secondary/10 text-secondary" },
  { num: "05", title: "Interview & Biometrics", desc: "Prepare for and attend your embassy appointment.", icon: Users, color: "bg-accent/10 text-accent-foreground" },
  { num: "06", title: "Work Permit Approved", desc: "Receive your permit and start your new chapter abroad.", icon: Award, color: "bg-primary/10 text-primary" },
];

const WorkPermits = () => {
  const [activeTab, setActiveTab] = useState<"programs" | "compare" | "eligibility">("programs");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("");
  const [experience, setExperience] = useState("");
  const [age, setAge] = useState("");
  const [showResult, setShowResult] = useState(false);

  const totalPoints = useMemo(() => {
    const eduPts = educationLevels.find((e) => e.value === education)?.points || 0;
    const langPts = languageLevels.find((l) => l.value === language)?.points || 0;
    const expPts = experienceOptions.find((e) => e.value === experience)?.points || 0;
    const agePts = ageRanges.find((a) => a.value === age)?.points || 0;
    return eduPts + langPts + expPts + agePts;
  }, [education, language, experience, age]);

  const maxPoints = 15;
  const eligible = totalPoints >= 6;

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (totalPoints < 6) {
      const langPts = languageLevels.find((l) => l.value === language)?.points || 0;
      if (langPts < 3) recs.push("Improve language proficiency to B2+ for more points.");
      const eduPts = educationLevels.find((e) => e.value === education)?.points || 0;
      if (eduPts < 3) recs.push("A higher education qualification would boost your score.");
      const expPts = experienceOptions.find((e) => e.value === experience)?.points || 0;
      if (expPts < 2) recs.push("Gain more work experience in your field.");
    }
    return recs;
  }, [totalPoints, language, education, experience]);

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
          <div className="container relative z-10 text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                Immigration Services
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Work Permits & <span className="text-gradient-accent">Immigration</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Expert guidance through every step of the work permit and immigration process.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="border-b sticky top-0 z-20 bg-background">
          <div className="container">
            <div className="flex gap-1">
              {[
                { key: "programs" as const, label: "Programs", icon: Briefcase },
                { key: "compare" as const, label: "Compare Programs", icon: Globe },
                { key: "eligibility" as const, label: "Eligibility Checker", icon: Calculator },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <>
            <section className="py-24">
              <div className="container">
                <motion.div {...fadeUp} className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Our Immigration Programs</h2>
                  <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Choose your destination — we'll handle the rest.</p>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-8">
                  {programs.map((program, i) => (
                    <motion.div key={program.title} {...fadeUp} transition={{ delay: i * 0.1 }}>
                      <Link to={program.link} className="group block bg-card rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                        <div className="flex items-start gap-5">
                          <span className="text-5xl">{program.flag}</span>
                          <div className="flex-1">
                            <h3 className="text-xl font-display font-bold text-card-foreground group-hover:text-secondary transition-colors">{program.title}</h3>
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
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">Get your credentials evaluated for international recognition.</p>
                    <div className="mt-6 space-y-3">
                      {["Educational Credential Assessment (ECA)", "Nursing credential verification (CGFNS-type)", "Transcripts & qualification reviews", "Certificate upload & status tracking"].map((item) => (
                        <div key={item} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /><span className="text-foreground">{item}</span></div>
                      ))}
                    </div>
                    <Button variant="accent" size="lg" className="mt-8" asChild>
                      <Link to="/work-permits/credential-evaluation">Start Evaluation <ArrowRight className="w-5 h-5" /></Link>
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
                          { step: "4", title: "Application Support", desc: "We help you use the report in your application." },
                        ].map((item) => (
                          <div key={item.step} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-display font-bold text-accent">{item.step}</div>
                            <div><h4 className="font-semibold text-card-foreground">{item.title}</h4><p className="text-sm text-muted-foreground mt-1">{item.desc}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Immigration Process Infographic */}
            <section className="py-24">
              <div className="container">
                <motion.div {...fadeUp} className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">The Immigration Journey</h2>
                  <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">A clear, 6-step process from consultation to approval.</p>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processSteps.map((s, i) => (
                    <motion.div key={s.num} {...fadeUp} transition={{ delay: i * 0.08 }} className="bg-card rounded-2xl p-6 border shadow-card hover:shadow-card-hover transition-all relative overflow-hidden">
                      <span className="absolute top-4 right-4 text-4xl font-display font-bold text-muted-foreground/10">{s.num}</span>
                      <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-bold text-foreground">{s.title}</h4>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                      {i < processSteps.length - 1 && <ChevronRight className="w-5 h-5 text-muted-foreground/20 absolute bottom-4 right-4 hidden lg:block" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Compare Tab */}
        {activeTab === "compare" && (
          <section className="py-16">
            <div className="container">
              <motion.div {...fadeUp} className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold text-foreground">Program Comparison</h2>
                <p className="text-muted-foreground mt-3">Side-by-side comparison of all work permit programs.</p>
              </motion.div>
              <motion.div {...fadeUp} className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 font-display font-bold text-foreground text-sm">Feature</th>
                      <th className="text-center py-4 px-4"><div className="flex flex-col items-center gap-1"><span className="text-2xl">🇪🇺</span><span className="font-display font-bold text-foreground text-xs">Schengen</span></div></th>
                      <th className="text-center py-4 px-4"><div className="flex flex-col items-center gap-1"><span className="text-2xl">🇨🇦</span><span className="font-display font-bold text-foreground text-xs">Canada LMIA</span></div></th>
                      <th className="text-center py-4 px-4"><div className="flex flex-col items-center gap-1"><span className="text-2xl">🇩🇪</span><span className="font-display font-bold text-foreground text-xs">Germany Card</span></div></th>
                      <th className="text-center py-4 px-4"><div className="flex flex-col items-center gap-1"><span className="text-2xl">🇺🇸</span><span className="font-display font-bold text-foreground text-xs">USA NCLEX</span></div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, i) => (
                      <tr key={row.feature} className={`border-b ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                        <td className="py-3 px-4 font-medium text-foreground text-sm">{row.feature}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.schengen}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.canada}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.germany}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.usa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
              <div className="flex justify-center gap-3 mt-8">
                {programs.map((p) => (
                  <Button key={p.title} variant="outline" size="sm" asChild>
                    <Link to={p.link}>{p.flag} Apply <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Eligibility Checker Tab */}
        {activeTab === "eligibility" && (
          <section className="py-16">
            <div className="container max-w-3xl">
              <motion.div {...fadeUp} className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold text-foreground">Eligibility Checker</h2>
                <p className="text-muted-foreground mt-3">Answer a few questions to see which programs you qualify for.</p>
              </motion.div>

              <motion.div {...fadeUp} className="bg-card rounded-2xl border shadow-card p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Profession</label>
                    <Select value={profession} onValueChange={setProfession}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select your profession" /></SelectTrigger>
                      <SelectContent>{professions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Highest Education</label>
                    <Select value={education} onValueChange={setEducation}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select education level" /></SelectTrigger>
                      <SelectContent>{educationLevels.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Languages className="w-4 h-4 text-primary" /> Language Proficiency (English/German/French)</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select language level" /></SelectTrigger>
                      <SelectContent>{languageLevels.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Work Experience</label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select experience" /></SelectTrigger>
                      <SelectContent>{experienceOptions.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Age Range</label>
                    <Select value={age} onValueChange={setAge}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select age range" /></SelectTrigger>
                      <SelectContent>{ageRanges.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <Button variant="accent" className="w-full h-12 text-base" onClick={() => setShowResult(true)} disabled={!profession || !education || !language || !experience || !age}>
                    <Calculator className="w-5 h-5 mr-2" /> Check Eligibility
                  </Button>
                </div>

                {/* Result */}
                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-8 border-t">
                    <div className="text-center mb-6">
                      <div className="relative w-28 h-28 mx-auto mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-muted" />
                          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className={eligible ? "stroke-secondary" : "stroke-destructive"} strokeDasharray={`${(totalPoints / maxPoints) * 251} 251`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-display font-bold text-2xl text-foreground">{totalPoints}</span>
                          <span className="text-[10px] text-muted-foreground">/ {maxPoints} pts</span>
                        </div>
                      </div>

                      <Badge className={`text-sm px-4 py-1 ${eligible ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {eligible ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Likely Eligible</> : <><XCircle className="w-4 h-4 mr-1" /> Needs Improvement</>}
                      </Badge>
                    </div>

                    {/* Program matches */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-display font-semibold text-foreground text-sm">Program Matches</h4>
                      {[
                        { name: "Germany Opportunity Card", min: 6, flag: "🇩🇪" },
                        { name: "Schengen Work Permit", min: 5, flag: "🇪🇺" },
                        { name: "Canada LMIA", min: 4, flag: "🇨🇦" },
                        { name: "USA NCLEX", min: 7, flag: "🇺🇸" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-foreground">{p.flag} {p.name}</span>
                          <Badge variant="outline" className={totalPoints >= p.min ? "bg-secondary/10 text-secondary border-secondary/20" : "text-muted-foreground"}>
                            {totalPoints >= p.min ? "Eligible" : `Need ${p.min - totalPoints} more pts`}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div className="bg-accent/5 rounded-xl p-5 border border-accent/20">
                        <h4 className="font-display font-semibold text-foreground text-sm mb-3">💡 Recommendations to Improve</h4>
                        <div className="space-y-2">
                          {recommendations.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button variant="accent" className="flex-1" asChild>
                        <Link to="/consultation">Book Consultation <ArrowRight className="w-4 h-4 ml-1" /></Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to="/work-permits/germany-chancenkarte">Detailed Calculator <Calculator className="w-4 h-4 ml-1" /></Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 bg-primary">
          <div className="container text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">Ready to Start Your Immigration Journey?</h2>
              <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg">Book a free consultation with our immigration experts today.</p>
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
