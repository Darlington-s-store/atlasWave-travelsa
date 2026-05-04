import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Briefcase, 
  Plane, 
  CreditCard, 
  History, 
  ShieldAlert, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  FileText,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Contact Details", icon: Phone },
  { id: 3, label: "Occupation", icon: Briefcase },
  { id: 4, label: "Travel Info", icon: Plane },
  { id: 5, label: "Financial Info", icon: CreditCard },
  { id: 6, label: "Travel History", icon: History },
  { id: 7, label: "Security", icon: ShieldAlert },
  { id: 8, label: "Documents", icon: Upload },
];

const VisaApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: user?.fullName || "",
    dob: "",
    gender: "",
    nationality: "Ghanaian",
    passportNumber: "",
    // Step 2: Contact Details
    phone: user?.phone || "",
    email: user?.email || "",
    residentialAddress: "",
    // Step 3: Occupation & Education
    jobTitle: "",
    employerName: "",
    monthlyIncome: "",
    // Step 4: Travel Details
    purpose: "",
    travelDate: "",
    returnDate: "",
    destinationCountry: "",
    durationOfStay: "",
    accommodationAddress: "",
    // Step 5: Financial Information
    sponsor: "Self",
    bankBalance: "",
    incomeSource: "",
    // Step 6: Travel History
    previousCountries: "",
    previousRefusals: "No",
    refusalDetails: "",
    // Step 7: Security Questions
    criminalHistory: "No",
    immigrationViolations: "No",
    healthIssues: "No",
    // Step 8: Documents (list of uploaded names)
    documents: [] as string[],
  });

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFileUpload = (docName: string) => {
    if (!formData.documents.includes(docName)) {
      updateField("documents", [...formData.documents, docName]);
      toast({ title: "File Added", description: `${docName} added to your application.` });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to submit your application.", variant: "destructive" });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        title: `${formData.destinationCountry || formData.nationality} Visa Application - ${formData.purpose}`,
        type: "Visa Application",
        status: "pending",
        details: JSON.stringify(formData),
        // Map top-level columns for better filtering/searching
        first_name: formData.fullName.split(" ")[0],
        last_name: formData.fullName.split(" ").slice(1).join(" "),
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dob,
        gender: formData.gender,
        nationality: formData.nationality,
        passport_number: formData.passportNumber,
        occupation: formData.jobTitle,
        employer: formData.employerName,
        purpose: formData.purpose,
        intended_travel_date: formData.travelDate,
        return_date: formData.returnDate,
        destination_country: formData.destinationCountry,
        address: formData.residentialAddress,
        // Specialized fields
        sponsor: formData.sponsor,
        bank_balance: formData.bankBalance,
        income_source: formData.incomeSource,
        previous_refusals: formData.previousRefusals,
        criminal_history: formData.criminalHistory,
        immigration_violations: formData.immigrationViolations,
        health_issues: formData.healthIssues,
        duration_of_stay: formData.durationOfStay,
        accommodation_address: formData.accommodationAddress
      });

      if (error) throw error;

      toast({ 
        title: "Application Submitted!", 
        description: "Your comprehensive visa application has been received successfully.",
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({ title: "Submission Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Personal Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name (as in passport)</Label>
                <Input value={formData.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dob} onChange={e => updateField("dob", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={v => updateField("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={formData.nationality} onChange={e => updateField("nationality", e.target.value)} placeholder="e.g. Ghanaian" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Passport Number</Label>
                <Input value={formData.passportNumber} onChange={e => updateField("passportNumber", e.target.value)} placeholder="Enter your passport number" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Contact Details</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+233 XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Residential Address</Label>
                <Textarea value={formData.residentialAddress} onChange={e => updateField("residentialAddress", e.target.value)} placeholder="Enter your full residential address (e.g., Accra, Ghana)" rows={3} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Occupation & Education</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title / Current Status</Label>
                <Input value={formData.jobTitle} onChange={e => updateField("jobTitle", e.target.value)} placeholder="e.g. Software Developer" />
              </div>
              <div className="space-y-2">
                <Label>Employer / School Name</Label>
                <Input value={formData.employerName} onChange={e => updateField("employerName", e.target.value)} placeholder="Enter company or institution" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Monthly Income (Approximate)</Label>
                <Input value={formData.monthlyIncome} onChange={e => updateField("monthlyIncome", e.target.value)} placeholder="e.g. GHS 5,000" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Travel Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Purpose of Visit</Label>
                <Select value={formData.purpose} onValueChange={v => updateField("purpose", v)}>
                  <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tourism">Tourism</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Study">Study</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Family Visit">Family Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Country</Label>
                <Input value={formData.destinationCountry} onChange={e => updateField("destinationCountry", e.target.value)} placeholder="e.g. United Kingdom" />
              </div>
              <div className="space-y-2">
                <Label>Intended Travel Date</Label>
                <Input type="date" value={formData.travelDate} onChange={e => updateField("travelDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expected Return Date</Label>
                <Input type="date" value={formData.returnDate} onChange={e => updateField("returnDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration of Stay</Label>
                <Input value={formData.durationOfStay} onChange={e => updateField("durationOfStay", e.target.value)} placeholder="e.g. 14 days" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Accommodation Address abroad</Label>
                <Textarea value={formData.accommodationAddress} onChange={e => updateField("accommodationAddress", e.target.value)} placeholder="Hotel address or host address" rows={2} />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Financial Information</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Who is sponsoring the trip?</Label>
                <Select value={formData.sponsor} onValueChange={v => updateField("sponsor", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self">Self</SelectItem>
                    <SelectItem value="Employer">Employer</SelectItem>
                    <SelectItem value="Family Member">Family Member</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Bank Balance</Label>
                <Input value={formData.bankBalance} onChange={e => updateField("bankBalance", e.target.value)} placeholder="e.g. GHS 20,000" />
              </div>
              <div className="space-y-2">
                <Label>Source of Income</Label>
                <Input value={formData.incomeSource} onChange={e => updateField("incomeSource", e.target.value)} placeholder="e.g. Monthly Salary, Business Profits" />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Travel History</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Countries visited in the last 5 years</Label>
                <Textarea value={formData.previousCountries} onChange={e => updateField("previousCountries", e.target.value)} placeholder="List countries and dates..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Have you ever been refused a visa?</Label>
                <Select value={formData.previousRefusals} onValueChange={v => updateField("previousRefusals", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.previousRefusals === "Yes" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-2">
                  <Label>Provide details of refusal</Label>
                  <Textarea value={formData.refusalDetails} onChange={e => updateField("refusalDetails", e.target.value)} placeholder="Country, date, and reason..." rows={2} />
                </motion.div>
              )}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground">Security Questions</h3>
            <div className="space-y-6">
              {[
                { field: "criminalHistory", label: "Do you have any criminal history?" },
                { field: "immigrationViolations", label: "Have you ever violated immigration laws?" },
                { field: "healthIssues", label: "Do you have any serious health-related conditions?" },
              ].map((q) => (
                <div key={q.field} className="space-y-2">
                  <Label>{q.label}</Label>
                  <Select value={(formData as Record<string, string | string[]>)[q.field] as string} onValueChange={v => updateField(q.field, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive/80">Providing false information on security questions will lead to immediate visa refusal and potential travel bans.</p>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-foreground">Document Upload</h3>
            <p className="text-sm text-muted-foreground mb-4">Attach proof for your application. Max size 5MB per file (PDF/JPG).</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Passport (Data Page)",
                "Passport Photo (White BG)",
                "Bank Statement (Last 6 Months)",
                "Employment/School Letter",
                "Flight Itinerary",
                "Hotel Booking",
                "Cover Letter",
              ].map((doc) => {
                const isUploaded = formData.documents.includes(doc);
                return (
                  <div 
                    key={doc} 
                    onClick={() => handleFileUpload(doc)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                      isUploaded ? "border-secondary bg-secondary/5" : "border-border hover:border-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isUploaded ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground")}>
                        {isUploaded ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium">{doc}</span>
                    </div>
                    {isUploaded && <Badge variant="secondary" className="text-[10px]">Added</Badge>}
                  </div>
                );
              })}
            </div>
            {formData.documents.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Ready to Submit
                </h4>
                <p className="text-sm text-foreground">{formData.documents.length} of 7 key documents added.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-10 text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4 border border-accent/20">
                Official Visa Portal
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Visa <span className="text-gradient-accent">Application</span> Form
              </h1>
              <p className="text-muted-foreground mt-4">
                Please complete all sections accurately to ensure a smooth processing of your application.
              </p>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4 px-2 overflow-x-auto gap-4 pb-2">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 min-w-fit">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isActive ? "border-accent bg-accent text-accent-foreground scale-110" : 
                      isCompleted ? "border-secondary bg-secondary text-secondary-foreground" : 
                      "border-border bg-card text-muted-foreground"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      isActive ? "text-accent" : isCompleted ? "text-secondary" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-0" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 pt-6 border-t">
              {currentStep > 1 && (
                <Button variant="outline" size="lg" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button variant="accent" size="lg" onClick={nextStep} className="flex-1">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || formData.documents.length < 3} 
                  className="flex-1 font-bold"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"} <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            {currentStep === STEPS.length && formData.documents.length < 3 && (
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> Please upload at least 3 documents to enable submission.
              </p>
            )}
          </div>

          <div className="mt-8 bg-muted rounded-xl p-5 border flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-1">Your Data is Protected</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AtlasWave uses military-grade encryption to protect your sensitive documents and personal information. Your data is only shared with official immigration authorities.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisaApplication;
