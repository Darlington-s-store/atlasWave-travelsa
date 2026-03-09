import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plane, Hotel, FileCheck, ArrowRight, MapPin, Calendar, Users, Star, CheckCircle2, Globe } from "lucide-react";
import VideoSection from "@/components/VideoSection";
import heroTravel from "@/assets/hero-travel.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const TravelServices = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroTravel} alt="Travel destination" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                Travel & Tours
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Explore the <span className="text-gradient-accent">World</span> With Us
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Book flights, reserve hotels, and get expert visa assistance — all in one place.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Flight Booking */}
        <section id="flights" className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeUp}>
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Plane className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Flight Booking</h2>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  Book international and local flights at competitive prices. We offer custom travel packages tailored to your schedule and budget.
                </p>
                <div className="mt-6 space-y-3">
                  {["International & domestic flights", "Group booking discounts", "Flexible cancellation options", "24/7 booking support", "Custom travel packages"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-6">Search Flights</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Departure city" className="pl-9" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Destination city" className="pl-9" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Departure</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Return</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Passengers</label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n} Passenger{n > 1 ? 's' : ''}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Class</label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="first">First Class</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="accent" className="w-full" size="lg">
                      Search Flights <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Hotel & Accommodation */}
        <section id="hotels" className="py-24 bg-muted">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="order-2 lg:order-1">
                <div className="bg-card rounded-2xl p-8 border shadow-card">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-6">Find Hotels</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="City or hotel name" className="pl-9" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Check-in</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Check-out</label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Rooms</label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n} Room{n > 1 ? 's' : ''}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Guests</label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? 's' : ''}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="accent" className="w-full" size="lg">
                      Search Hotels <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} className="order-1 lg:order-2">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Hotel className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Hotel & Accommodation</h2>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  Find and book the perfect accommodation worldwide. From budget-friendly stays to luxury resorts, we have options for every traveler.
                </p>
                <div className="mt-6 space-y-3">
                  {["Global hotel network", "Best price guarantee", "Free cancellation options", "Verified guest reviews", "24/7 concierge support"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Visa Assistance */}
        <section id="visa" className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Visa Assistance</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Expert guidance for all visa categories — tourist, student, and work visas processed with care and precision.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Tourist Visas",
                  icon: Globe,
                  desc: "Planning a vacation? We handle visa applications for all major tourist destinations worldwide.",
                  features: ["Application preparation", "Document review", "Interview coaching", "Fast processing"],
                },
                {
                  title: "Student Visas",
                  icon: Users,
                  desc: "Pursuing education abroad? We help secure student visas for universities across Europe, North America, and beyond.",
                  features: ["University application support", "Financial documentation", "Scholarship guidance", "Pre-departure briefing"],
                },
                {
                  title: "Work Visas",
                  icon: Star,
                  desc: "Seeking employment abroad? We specialize in work visa processing for multiple countries and programs.",
                  features: ["Employer sponsorship", "Skills assessment", "Labor market testing", "Family reunification"],
                },
              ].map((visa, i) => (
                <motion.div
                  key={visa.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                    <visa.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-card-foreground">{visa.title}</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{visa.desc}</p>
                  <div className="mt-5 space-y-2">
                    {visa.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button variant="accent" className="w-full mt-6" asChild>
                    <Link to="/consultation">Apply Now</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <VideoSection category="services" title="Travel Videos" subtitle="See what awaits you at your dream destinations." />

        {/* CTA */}
        <section className="py-20 bg-primary">
          <div className="container text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                Ready to Plan Your Next Trip?
              </h2>
              <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg">
                Let our travel experts create the perfect itinerary for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/consultation">Book Consultation</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelServices;
