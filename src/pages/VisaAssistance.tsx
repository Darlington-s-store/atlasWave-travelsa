import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Clock,
  Shield,
  User,
  Plane,
  Upload,
  Eye,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const countries = [
  "Select country...", "France", "Germany", "Italy", "Netherlands", "Spain", "United Kingdom",
  "United States", "Canada", "Australia", "UAE", "Japan", "South Korea",
];

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Travel Info", icon: Plane },
  { id: 3, label: "Documents", icon: Upload },
  { id: 4, label: "Review", icon: Eye },
  { id: 5, label: "Payment", icon: CreditCard },
];

const MOCK_APPLICATIONS = [
  { id: "VSA-2024-001", country: "🇬🇧 United Kingdom", type: "Standard Visitor Visa", status: "in-review" as const, submitted: "Mar 01, 2024" },
  { id: "VSA-2024-002", country: "🇪🇺 Schengen (France)", type: "Tourist Visa", status: "approved" as const, submitted: "Feb 15, 2024" },
];

const statusColors = {
  "pending": "bg-accent/10 text-accent-foreground border-accent/20",
  "in-review": "bg-primary/10 text-primary border-primary/20",
  "approved": "bg-secondary/10 text-secondary border-secondary/20",
  "rejected": "bg-destructive/10 text-destructive border-destructive/20",
};

const VisaAssistance = () => {
  const [activeTab, setActiveTab] = useState<"programs" | "apply" | "track">("programs");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", dob: "", nationality: "",
    destination: "", visaType: "", travelDate: "", returnDate: "", purpose: "",
    documents: [] as string[],
  });

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    toast({ title: "Application Submitted!", description: "Your visa application has been received. You'll get email updates on progress." });
    setActiveTab("track");
    setCurrentStep(1);
  };

  const handleFileUpload = (docName: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.includes(docName) ? prev.documents : [...prev.documents, docName],
    }));
    toast({ title: "File Uploaded", description: `${docName} uploaded successfully.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 w-80 h-80 rounded-full bg-accent blur-[120px]" />
          </div>
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

        {/* Tab Navigation */}
        <section className="border-b sticky top-0 z-20 bg-background">
          <div className="container">
            <div className="flex gap-1">
              {[
                { key: "programs" as const, label: "Visa Programs", icon: Globe },
                { key: "apply" as const, label: "Apply Now", icon: FileText },
                { key: "track" as const, label: "Track Application", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
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
                          <span className="text-secondary font-medium">{v.success}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Fee</span>
                          <span className="text-foreground font-bold">{v.price}</span>
                        </div>
                      </div>
                      <Button variant="accent" size="sm" className="w-full mt-4" onClick={() => { setActiveTab("apply"); updateField("visaType", v.name); }}>
                        Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Process Steps */}
            <section className="py-16 bg-muted">
              <div className="container max-w-3xl">
                <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
                  How It <span className="text-gradient-accent">Works</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Free Consultation", desc: "We assess your eligibility and recommend the best visa type." },
                    { step: "02", title: "Document Preparation", desc: "Our team helps you compile and review all required documents." },
                    { step: "03", title: "Application Submission", desc: "We submit your application and track its progress in real-time." },
                    { step: "04", title: "Visa Approved", desc: "Receive your visa and travel with confidence." },
                  ].map((s, i) => (
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
                  <Button variant="accent" size="lg" onClick={() => setActiveTab("apply")}>
                    Start Application <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Apply Tab — Multi-step form */}
        {activeTab === "apply" && (
          <section className="py-16">
            <div className="container max-w-3xl">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-10">
                {STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id;
                  return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isDone ? "bg-secondary border-secondary" : isActive ? "bg-primary border-primary" : "bg-card border-border"
                        }`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-secondary-foreground" /> : <StepIcon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                        </div>
                        <span className={`text-xs mt-2 hidden sm:block ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isDone ? "bg-secondary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-2xl border shadow-card p-8"
                >
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-display font-bold text-card-foreground">Personal Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input placeholder="John Doe" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <Input type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} className="h-12" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input placeholder="+233 XX XXX XXXX" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-12" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nationality</Label>
                        <select
                          className="w-full h-12 rounded-md border border-input bg-background px-3 text-sm"
                          value={formData.nationality}
                          onChange={(e) => updateField("nationality", e.target.value)}
                        >
                          <option value="">Select nationality...</option>
                          <option>Ghanaian</option>
                          <option>Nigerian</option>
                          <option>Kenyan</option>
                          <option>South African</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Travel Info */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-display font-bold text-card-foreground">Travel Information</h3>
                      <div className="space-y-2">
                        <Label>Destination Country</Label>
                        <select
                          className="w-full h-12 rounded-md border border-input bg-background px-3 text-sm"
                          value={formData.destination}
                          onChange={(e) => updateField("destination", e.target.value)}
                        >
                          {countries.map((c) => <option key={c} value={c === "Select country..." ? "" : c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Visa Type</Label>
                        <select
                          className="w-full h-12 rounded-md border border-input bg-background px-3 text-sm"
                          value={formData.visaType}
                          onChange={(e) => updateField("visaType", e.target.value)}
                        >
                          <option value="">Select visa type...</option>
                          <option>Tourist Visa</option>
                          <option>Student Visa</option>
                          <option>Work Visa</option>
                          <option>Business Visa</option>
                          <option>Transit Visa</option>
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Travel Date</Label>
                          <Input type="date" value={formData.travelDate} onChange={(e) => updateField("travelDate", e.target.value)} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Return Date</Label>
                          <Input type="date" value={formData.returnDate} onChange={(e) => updateField("returnDate", e.target.value)} className="h-12" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Purpose of Travel</Label>
                        <Textarea placeholder="Describe the purpose of your trip..." value={formData.purpose} onChange={(e) => updateField("purpose", e.target.value)} rows={3} />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Document Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-display font-bold text-card-foreground">Document Upload</h3>
                      <p className="text-sm text-muted-foreground">Upload the required documents for your visa application.</p>
                      <div className="space-y-3">
                        {["Passport (Bio Page)", "Passport Photo (White Background)", "Bank Statement (3 months)", "Travel Insurance", "Flight Itinerary", "Hotel Reservation"].map((doc) => {
                          const uploaded = formData.documents.includes(doc);
                          return (
                            <div key={doc} className="flex items-center justify-between p-4 rounded-xl border bg-muted/50">
                              <div className="flex items-center gap-3">
                                {uploaded ? <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" /> : <Upload className="w-5 h-5 text-muted-foreground shrink-0" />}
                                <span className={`text-sm ${uploaded ? "text-foreground font-medium" : "text-muted-foreground"}`}>{doc}</span>
                              </div>
                              <Button variant={uploaded ? "outline" : "default"} size="sm" onClick={() => handleFileUpload(doc)}>
                                {uploaded ? "Re-upload" : "Upload"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-display font-bold text-card-foreground">Review Application</h3>
                      <div className="space-y-4">
                        {[
                          { section: "Personal", items: [
                            { label: "Name", value: formData.fullName || "—" },
                            { label: "Email", value: formData.email || "—" },
                            { label: "Phone", value: formData.phone || "—" },
                            { label: "DOB", value: formData.dob || "—" },
                            { label: "Nationality", value: formData.nationality || "—" },
                          ]},
                          { section: "Travel", items: [
                            { label: "Destination", value: formData.destination || "—" },
                            { label: "Visa Type", value: formData.visaType || "—" },
                            { label: "Travel Date", value: formData.travelDate || "—" },
                            { label: "Return Date", value: formData.returnDate || "—" },
                          ]},
                          { section: "Documents", items: [
                            { label: "Uploaded", value: `${formData.documents.length} of 6 documents` },
                          ]},
                        ].map((group) => (
                          <div key={group.section} className="bg-muted rounded-xl p-5">
                            <h4 className="font-semibold text-foreground text-sm mb-3">{group.section} Details</h4>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {group.items.map((item) => (
                                <div key={item.label} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="text-foreground font-medium">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Payment */}
                  {currentStep === 5 && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-display font-bold text-card-foreground">Payment</h3>
                      <div className="bg-muted rounded-xl p-6">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Visa Processing Fee</span>
                            <span className="font-medium text-foreground">$150.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service Fee</span>
                            <span className="font-medium text-foreground">$50.00</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-bold text-lg text-foreground">$200.00</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="h-14 gap-2"><CreditCard className="w-5 h-5" /> Mastercard</Button>
                          <Button variant="outline" className="h-14 gap-2"><Phone className="w-5 h-5" /> Mobile Money</Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-4 bg-secondary/10 rounded-xl">
                        <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">Your payment is secured with 3D Secure authentication. You'll receive a confirmation email upon successful payment.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    {currentStep < 5 ? (
                      <Button variant="accent" onClick={nextStep}>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="accent" onClick={handleSubmit}>
                        Submit & Pay $200 <CheckCircle2 className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Track Tab */}
        {activeTab === "track" && (
          <section className="py-16">
            <div className="container max-w-3xl">
              <motion.div {...fadeUp}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Your Applications</h2>
                <p className="text-muted-foreground text-sm mb-8">Track the status of your visa applications. You'll also receive email and SMS notifications.</p>

                {MOCK_APPLICATIONS.length === 0 ? (
                  <div className="bg-card rounded-2xl border p-12 text-center">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No applications yet. Start a new application above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {MOCK_APPLICATIONS.map((app) => (
                      <div key={app.id} className="bg-card rounded-xl border shadow-card p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display font-bold text-foreground">{app.id}</span>
                              <Badge variant="outline" className={statusColors[app.status]}>
                                {app.status.replace("-", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.country} — {app.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">Submitted: {app.submitted}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View Details</Button>
                            <Button variant="ghost" size="sm">Re-upload Docs</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VisaAssistance;
