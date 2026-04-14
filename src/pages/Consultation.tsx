import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Video, Users, Phone, Clock, CreditCard, Shield, Globe, CalendarX, RefreshCw, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const consultationTypes = [
  {
    icon: Video, title: "Online Video Consultation", mode: "online" as const,
    desc: "Meet with our experts via Zoom or Google Meet from anywhere in the world.",
    prices: { "30": 35, "45": 50, "60": 70 },
    features: ["Face-to-face guidance", "Screen sharing for documents", "Recording available", "Flexible scheduling"],
  },
  {
    icon: Phone, title: "Phone Consultation", mode: "online" as const,
    desc: "Quick phone call with our immigration or travel specialist.",
    prices: { "30": 30, "45": 40, "60": 55 },
    features: ["Quick answers", "Follow-up email summary", "No app needed", "Same-day availability"],
  },
  {
    icon: Users, title: "In-Person Consultation", mode: "in-person" as const,
    desc: "Visit our Accra office for a comprehensive face-to-face meeting.",
    prices: { "30": 50, "45": 75, "60": 100 },
    features: ["Document review on-site", "Comprehensive assessment", "Personalized action plan", "Refreshments included"],
  },
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM",
];

const timezones = [
  { value: "GMT+0", label: "GMT (Accra)" },
  { value: "GMT+1", label: "GMT+1 (Lagos, London BST)" },
  { value: "GMT+2", label: "GMT+2 (Cairo, Johannesburg)" },
  { value: "GMT+3", label: "GMT+3 (Nairobi, Istanbul)" },
  { value: "GMT+4", label: "GMT+4 (Dubai)" },
  { value: "GMT-5", label: "GMT-5 (New York, Toronto)" },
  { value: "GMT-8", label: "GMT-8 (Los Angeles)" },
];

interface ConsultationBooking {
  id: string;
  type: string;
  topic: string | null;
  date: string;
  time: string;
  duration: number;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
}

const Consultation = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [duration, setDuration] = useState<"30" | "45" | "60">("45");
  const [timezone, setTimezone] = useState("GMT+0");
  const [modeFilter, setModeFilter] = useState<"all" | "online" | "in-person">("all");
  const [step, setStep] = useState(1);
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [contactForm, setContactForm] = useState({ firstName: "", lastName: "", email: user?.email || "", phone: user?.phone || "", topic: "", notes: "" });

  useEffect(() => {
    if (isAuthenticated && showBookings) {
      supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setBookings(data.map((d: any) => ({
            id: d.id.slice(0, 8).toUpperCase(),
            type: d.type,
            topic: d.topic,
            date: d.date,
            time: d.time,
            duration: d.duration,
            status: d.status,
            price: Number(d.price),
          })));
        });
    }
  }, [isAuthenticated, showBookings]);

  const selectedConsultation = consultationTypes.find((c) => c.title === selectedType);
  const price = selectedConsultation ? selectedConsultation.prices[duration] : 0;

  const filteredTypes = modeFilter === "all" ? consultationTypes : consultationTypes.filter((c) => c.mode === modeFilter);

  // Mock unavailable slots
  const unavailableSlots = ["10:30 AM", "01:30 PM", "03:30 PM"];

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
                Expert Guidance
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Book a <span className="text-gradient-accent">Consultation</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Get personalized advice from our travel, immigration, and logistics experts. Choose online or in-person consultations.
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                <Button variant="hero-outline" size="sm" onClick={() => {
                  if (isAuthenticated) {
                    navigate("/dashboard");
                  } else {
                    navigate("/login");
                  }
                }}>
                  <CalendarX className="w-4 h-4 mr-2" /> Manage My Bookings
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* My Bookings */}
        <AnimatePresence>
          {showBookings && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="container py-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">My Consultations</h2>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No consultations booked yet.</p>
                  ) : bookings.map((b) => (
                    <div key={b.id} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-foreground text-sm">CON-{b.id}</span>
                          <Badge variant="outline" className={b.status === "upcoming" ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-muted text-muted-foreground"}>{b.status}</Badge>
                        </div>
                        <p className="text-sm text-foreground">{b.type} — {b.topic || "General"}</p>
                        <p className="text-xs text-muted-foreground">{b.date} at {b.time} · {b.duration} min · {formatCurrency(b.price, DEFAULT_CURRENCY)}</p>
                      </div>
                      {b.status === "upcoming" && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => toast({ title: "Rescheduled", description: "Please select a new date and time." })}>
                            <RefreshCw className="w-3 h-3 mr-1" /> Reschedule
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast({ title: "Cancelled", description: `Consultation ${b.id} has been cancelled.` })}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Consultation Types */}
        {!showBookings && (
          <section className="py-24">
            <div className="container">
              <motion.div {...fadeUp} className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Choose Your Consultation</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Select the type that works best for you.</p>
              </motion.div>

              {/* Mode Filter + Duration */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {(["all", "online", "in-person"] as const).map((m) => (
                    <Button key={m} variant={modeFilter === m ? "default" : "ghost"} size="sm" onClick={() => setModeFilter(m)} className="text-xs capitalize">
                      {m === "all" ? "All Types" : m}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  {(["30", "45", "60"] as const).map((d) => (
                    <Button key={d} variant={duration === d ? "default" : "outline"} size="sm" onClick={() => setDuration(d)} className="text-xs">
                      {d} min
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {filteredTypes.map((type, i) => (
                  <motion.div key={type.title} {...fadeUp} transition={{ delay: i * 0.1 }}>
                    <button
                      onClick={() => { setSelectedType(type.title); setStep(2); }}
                      className={cn(
                        "w-full text-left bg-card rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all duration-300",
                        selectedType === type.title && "ring-2 ring-secondary border-secondary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <type.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-display font-bold text-foreground">{formatCurrency(type.prices[duration], DEFAULT_CURRENCY)}</span>
                          <span className="block text-xs text-muted-foreground">{duration} min</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-display font-bold text-card-foreground">{type.title}</h3>
                      <Badge variant="outline" className="mt-2 text-[10px]">{type.mode}</Badge>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{type.desc}</p>
                      <div className="mt-5 space-y-2">
                        {type.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Booking Form */}
              {selectedType && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                  {/* Progress */}
                  <div className="flex items-center justify-center gap-2 mb-10">
                    {[
                      { num: 1, label: "Type" },
                      { num: 2, label: "Schedule" },
                      { num: 3, label: "Details" },
                      { num: 4, label: "Payment" },
                    ].map((s, i) => (
                      <div key={s.num} className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                          step >= s.num ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={cn("text-sm font-medium hidden sm:inline", step >= s.num ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                        {i < 3 && <div className={cn("w-8 h-0.5 mx-1", step > s.num ? "bg-secondary" : "bg-border")} />}
                      </div>
                    ))}
                  </div>

                  <div className="bg-card rounded-2xl p-8 md:p-10 border shadow-card">
                    {/* Step 2: Schedule */}
                    {step === 2 && (
                      <div>
                        <h3 className="text-xl font-display font-bold text-card-foreground mb-2">Select Date & Time</h3>
                        <p className="text-sm text-muted-foreground mb-6">Choose your preferred consultation date and time slot.</p>

                        {/* Timezone */}
                        <div className="mb-6">
                          <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Your Timezone</label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="w-full sm:w-72"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">Pick a Date</label>
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(d) => d < new Date() || d.getDay() === 0}
                              className={cn("p-3 pointer-events-auto rounded-xl border")}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">Available Time Slots ({timezone})</label>
                            <div className="grid grid-cols-2 gap-2">
                              {timeSlots.map((slot) => {
                                const unavailable = unavailableSlots.includes(slot);
                                return (
                                  <button
                                    key={slot}
                                    onClick={() => !unavailable && setSelectedTime(slot)}
                                    disabled={unavailable}
                                    className={cn(
                                      "px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                                      unavailable
                                        ? "bg-muted/50 text-muted-foreground/40 border-border cursor-not-allowed line-through"
                                        : selectedTime === slot
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-foreground border-border hover:border-secondary"
                                    )}
                                  >
                                    <Clock className="w-3 h-3 inline mr-1.5" />
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">Grey slots are already booked.</p>
                          </div>
                        </div>
                        <div className="flex justify-between mt-8">
                          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                          <Button variant="accent" onClick={() => date && selectedTime && setStep(3)} disabled={!date || !selectedTime}>
                            Continue <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 3 && (
                      <div>
                        <h3 className="text-xl font-display font-bold text-card-foreground mb-2">Your Details</h3>
                        <p className="text-sm text-muted-foreground mb-8">Fill in your contact information and consultation topic.</p>
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label><Input placeholder="John" /></div>
                            <div><label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label><Input placeholder="Doe" /></div>
                          </div>
                          <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><Input type="email" placeholder="john@example.com" /></div>
                          <div><label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label><Input type="tel" placeholder="+233 XX XXX XXXX" /></div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Consultation Topic</label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="travel">Travel & Flight Booking</SelectItem>
                                <SelectItem value="visa">Visa Assistance</SelectItem>
                                <SelectItem value="work-permit">Work Permits</SelectItem>
                                <SelectItem value="immigration">Immigration Programs</SelectItem>
                                <SelectItem value="logistics">Logistics & Shipping</SelectItem>
                                <SelectItem value="credential">Credential Evaluation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label><Textarea placeholder="Briefly describe what you'd like to discuss..." rows={3} /></div>
                          <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button variant="accent" onClick={() => setStep(4)}>
                              Continue to Payment <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Step 4: Payment */}
                    {step === 4 && selectedConsultation && (
                      <div>
                        <h3 className="text-xl font-display font-bold text-card-foreground mb-2">Review & Pay</h3>
                        <p className="text-sm text-muted-foreground mb-8">Review your booking details and complete payment to confirm.</p>

                        <div className="bg-muted rounded-xl p-6 mb-8 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Consultation Type</span>
                            <span className="font-semibold text-foreground">{selectedConsultation.title}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Mode</span>
                            <Badge variant="outline" className="capitalize text-xs">{selectedConsultation.mode}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-semibold text-foreground">{date?.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-semibold text-foreground">{selectedTime} ({timezone})</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-semibold text-foreground">{duration} minutes</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="text-2xl font-display font-bold text-secondary">{formatCurrency(price, DEFAULT_CURRENCY)}</span>
                          </div>
                        </div>

                        <div className="mb-8">
                          <label className="text-sm font-semibold text-foreground mb-3 block">Payment Method</label>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5 text-left">
                              <CreditCard className="w-6 h-6 text-primary" />
                              <div>
                                <span className="font-semibold text-foreground text-sm block">Mastercard / Visa</span>
                                <span className="text-xs text-muted-foreground">Credit or debit card</span>
                              </div>
                            </button>
                            <button className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-secondary text-left transition-colors">
                              <Phone className="w-6 h-6 text-secondary" />
                              <div>
                                <span className="font-semibold text-foreground text-sm block">Mobile Money</span>
                                <span className="text-xs text-muted-foreground">MoMo / Airtel Money</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                          <Shield className="w-4 h-4 text-secondary" />
                          Payments are processed securely. You can reschedule or cancel up to 24 hours before the appointment.
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                          <Button variant="accent" size="lg" onClick={async () => {
                            if (isAuthenticated && user) {
                              await supabase.from("consultations").insert({
                                user_id: user.id,
                                type: selectedConsultation.title,
                                topic: contactForm.topic || null,
                                duration: parseInt(duration),
                                date: date?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) || "",
                                time: selectedTime,
                                timezone,
                                price,
                                first_name: contactForm.firstName,
                                last_name: contactForm.lastName,
                                email: contactForm.email,
                                phone: contactForm.phone,
                                notes: contactForm.notes || null,
                              } as any);
                            }
                            toast({ title: "Booking Confirmed!", description: `Your ${duration}-min ${selectedConsultation.title} has been booked for ${selectedTime}.` });
                            setShowBookings(true);
                            setSelectedType("");
                            setStep(1);
                          }}>
                            Pay {formatCurrency(price, DEFAULT_CURRENCY)} & Confirm Booking <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Consultation;
