import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plane, Briefcase, GraduationCap, Ship, CheckCircle2, Globe, FileCheck } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const travelDocs = [
  {
    country: "General Travel",
    icon: Plane,
    documents: [
      "Valid passport (minimum 6 months validity)",
      "Return/onward flight ticket",
      "Proof of accommodation (hotel booking)",
      "Travel insurance certificate",
      "Proof of sufficient funds (bank statement)",
      "Passport-sized photographs (recent)",
    ],
  },
  {
    country: "Schengen Zone",
    icon: Globe,
    documents: [
      "Schengen visa application form",
      "Travel medical insurance (€30,000 minimum)",
      "Flight itinerary",
      "Hotel reservation or invitation letter",
      "Bank statements (last 3 months)",
      "Employment letter or business registration",
    ],
  },
  {
    country: "USA / Canada / UK",
    icon: FileCheck,
    documents: [
      "DS-160 / Online application form",
      "Valid passport with blank visa pages",
      "Visa appointment confirmation",
      "Financial proof (bank statements, tax returns)",
      "Purpose of travel documentation",
      "Ties to home country evidence",
    ],
  },
];

const workPermitDocs = [
  {
    program: "Schengen Work Permits",
    icon: Briefcase,
    documents: [
      "Valid passport",
      "Employment contract / job offer",
      "Recognized qualifications (apostilled)",
      "CV / Resume",
      "Criminal background check",
      "Health insurance proof",
      "Proof of accommodation",
      "Language proficiency certificate",
    ],
  },
  {
    program: "Canada LMIA",
    icon: FileText,
    documents: [
      "Valid passport",
      "Positive LMIA document",
      "Job offer from Canadian employer",
      "Educational credentials (ECA report)",
      "Language test results (IELTS/CELPIP)",
      "Medical examination results",
      "Police clearance certificate",
      "Proof of funds",
    ],
  },
  {
    program: "Germany Opportunity Card",
    icon: GraduationCap,
    documents: [
      "Valid passport",
      "Recognized qualification certificate",
      "German/English language certificate",
      "CV in German or English",
      "Proof of work experience",
      "Financial proof (blocked account)",
      "Health insurance",
      "Motivation letter",
    ],
  },
  {
    program: "USA NCLEX Pathway",
    icon: FileCheck,
    documents: [
      "Valid passport",
      "Nursing degree / diploma",
      "CGFNS certificate",
      "NCLEX-RN exam results",
      "VisaScreen certificate",
      "State nursing license",
      "English proficiency (IELTS/TOEFL)",
      "Employer sponsorship letter",
    ],
  },
];

const templates = [
  { name: "Visa Application Cover Letter", type: "DOCX", size: "24 KB", category: "Travel" },
  { name: "Travel Itinerary Template", type: "PDF", size: "18 KB", category: "Travel" },
  { name: "Financial Sponsorship Letter", type: "DOCX", size: "20 KB", category: "Travel" },
  { name: "Work Permit Application Checklist", type: "PDF", size: "32 KB", category: "Work Permit" },
  { name: "CV / Resume Template (International)", type: "DOCX", size: "45 KB", category: "Work Permit" },
  { name: "Motivation Letter Template", type: "DOCX", size: "22 KB", category: "Work Permit" },
  { name: "Employer Reference Letter Template", type: "DOCX", size: "18 KB", category: "Work Permit" },
  { name: "Document Checklist — Schengen", type: "PDF", size: "28 KB", category: "Work Permit" },
  { name: "Cargo Shipping Request Form", type: "PDF", size: "35 KB", category: "Logistics" },
  { name: "Customs Declaration Form Guide", type: "PDF", size: "40 KB", category: "Logistics" },
];

const Documentation = () => {
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
                Resources
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Documentation & <span className="text-gradient-accent">Templates</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Everything you need to prepare your travel, visa, and work permit applications — all in one place.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Travel Documents */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Travel Requirements</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">Required Travel Documents</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Documents you'll need for your travel visa applications by destination.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {travelDocs.map((doc, i) => (
                <motion.div key={doc.country} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-8 border shadow-card">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5">
                    <doc.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-card-foreground mb-4">{doc.country}</h3>
                  <div className="space-y-2.5">
                    {doc.documents.map((d) => (
                      <div key={d} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Work Permit Documents */}
        <section className="py-24 bg-muted">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-accent uppercase tracking-widest">Immigration Requirements</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">Work Permit Documents</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Comprehensive document lists for each immigration program we support.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {workPermitDocs.map((doc, i) => (
                <motion.div key={doc.program} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-8 border shadow-card">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <doc.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-card-foreground">{doc.program}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {doc.documents.map((d) => (
                      <div key={d} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Downloadable Templates */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Downloads</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">Downloadable Templates</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Pre-formatted templates to help you prepare your applications quickly.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-3">
                {templates.map((template, i) => (
                  <motion.div
                    key={template.name}
                    {...fadeUp}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 bg-card rounded-xl p-4 border shadow-card hover:shadow-card-hover transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground text-sm truncate">{template.name}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">{template.type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{template.size}</span>
                        <span className="text-xs font-medium text-secondary">{template.category}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 group-hover:border-secondary group-hover:text-secondary transition-colors">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
