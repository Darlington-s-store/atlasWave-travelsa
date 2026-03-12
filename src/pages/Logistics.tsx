import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Ship, Plane, Truck, FileCheck, Package, Search, ArrowRight, CheckCircle2, Clock, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import VideoSection from "@/components/VideoSection";
import heroLogistics from "@/assets/hero-logistics.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const services = [
  {
    icon: Plane,
    title: "Air Freight",
    desc: "Express air cargo services for time-sensitive shipments across the globe. Door-to-airport and airport-to-airport options available.",
    features: ["Express delivery", "Dangerous goods handling", "Temperature-controlled", "Real-time tracking"],
  },
  {
    icon: Ship,
    title: "Sea Cargo",
    desc: "Cost-effective ocean freight for large shipments. Full container load (FCL) and less than container load (LCL) services.",
    features: ["FCL & LCL options", "Port-to-port delivery", "Consolidation services", "Competitive rates"],
  },
  {
    icon: Truck,
    title: "Road Transport",
    desc: "Reliable ground transportation and last-mile delivery services across West Africa and beyond.",
    features: ["Door-to-door delivery", "Cross-border transport", "Fleet tracking", "Warehousing"],
  },
  {
    icon: FileCheck,
    title: "Customs Clearance",
    desc: "Expert customs brokerage services to ensure smooth and compliant clearance of your goods at any port of entry.",
    features: ["Import & export clearance", "Duty optimization", "Regulatory compliance", "Document handling"],
  },
];

const trackingSteps = [
  { status: "Order Placed", date: "2024-03-01", complete: true },
  { status: "Picked Up", date: "2024-03-02", complete: true },
  { status: "In Transit", date: "2024-03-05", complete: true },
  { status: "Customs Clearance", date: "2024-03-07", complete: false },
  { status: "Delivered", date: "—", complete: false },
];

const Logistics = () => {
  const [trackingId, setTrackingId] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const handleTrack = () => {
    if (trackingId.trim()) {
      setShowTracking(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroLogistics} alt="Cargo port" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
          </div>
          <div className="container relative z-10 text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                Logistics Solutions
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Reliable International <span className="text-gradient-accent">Shipping</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Air freight, sea cargo, road transport, and customs clearance — all with real-time tracking and dedicated support.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Shipment Tracking */}
        <section className="py-16 bg-muted">
          <div className="container">
            <motion.div {...fadeUp} className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-card-foreground">Track Your Shipment</h2>
                    <p className="text-sm text-muted-foreground">Enter your tracking ID to get real-time updates</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Tracking ID (e.g., GL-2024-00123)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    className="flex-1"
                  />
                  <Button variant="accent" onClick={handleTrack}>
                    <Search className="w-4 h-4" /> Track
                  </Button>
                </div>

                {showTracking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-8 border-t pt-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-card-foreground">Tracking: {trackingId}</h3>
                      <span className="text-xs font-semibold px-3 py-1 bg-secondary/10 text-secondary rounded-full">In Transit</span>
                    </div>
                    <div className="space-y-0">
                      {trackingSteps.map((step, i) => (
                        <div key={step.status} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 ${step.complete ? "bg-secondary border-secondary" : "bg-card border-border"}`}>
                              {step.complete && <CheckCircle2 className="w-3 h-3 text-secondary-foreground mx-auto" />}
                            </div>
                            {i < trackingSteps.length - 1 && (
                              <div className={`w-0.5 h-10 ${step.complete ? "bg-secondary" : "bg-border"}`} />
                            )}
                          </div>
                          <div className="pb-8">
                            <p className={`text-sm font-semibold ${step.complete ? "text-foreground" : "text-muted-foreground"}`}>{step.status}</p>
                            <p className="text-xs text-muted-foreground">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Our Services</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">End-to-End Logistics</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Comprehensive shipping and logistics solutions tailored to your needs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, i) => (
                <motion.div
                  key={service.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <service.icon className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-card-foreground">{service.title}</h3>
                      <p className="text-muted-foreground mt-2 leading-relaxed">{service.desc}</p>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {service.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <VideoSection category="services" title="Logistics in Action" subtitle="See how we handle cargo across the globe." bgClass="bg-muted" />

        {/* Why Choose Us */}
        <section className="py-24 bg-primary">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">Why Ship With AtlastWave Travel and Tour?</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Clock, title: "On-Time Delivery", desc: "98% on-time rate across all routes" },
                { icon: MapPin, title: "International Network", desc: "Partners in 50+ countries" },
                { icon: Shield, title: "Cargo Insurance", desc: "Full coverage for peace of mind" },
                { icon: Package, title: "Real-Time Tracking", desc: "Track every shipment live" },
              ].map((item, i) => (
                <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h4 className="font-display font-semibold text-primary-foreground">{item.title}</h4>
                  <p className="text-sm text-primary-foreground/60 mt-2">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="hero" size="lg" asChild>
                <Link to="/consultation">Get a Shipping Quote <ArrowRight className="w-5 h-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Logistics;
