import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Ship,
  Plane,
  FileCheck,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  Weight,
  Box,
  Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

interface TrackingEvent {
  status: string;
  location: string;
  date: string;
  time: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

const MOCK_SHIPMENT = {
  id: "AWL-2024-00847",
  origin: "Accra, Ghana",
  destination: "London, United Kingdom",
  mode: "Air Freight",
  modeIcon: Plane,
  weight: "45.2 kg",
  pieces: "3 packages",
  eta: "March 12, 2024",
  shipper: "Kofi Mensah",
  receiver: "James Thompson",
  status: "In Transit",
  progress: 60,
  events: [
    { status: "Order Placed", location: "Accra, Ghana", date: "Mar 01, 2024", time: "09:30 AM", description: "Shipment order confirmed and label created.", completed: true },
    { status: "Picked Up", location: "Accra Warehouse", date: "Mar 02, 2024", time: "02:15 PM", description: "Package collected from sender's location.", completed: true },
    { status: "Departed Origin", location: "Kotoka Int'l Airport", date: "Mar 03, 2024", time: "11:45 PM", description: "Shipment departed on flight AW-447.", completed: true },
    { status: "In Transit", location: "Transit Hub — Amsterdam", date: "Mar 05, 2024", time: "06:20 AM", description: "Package at transit hub, awaiting connecting flight.", completed: true, current: true },
    { status: "Customs Clearance", location: "London Heathrow", date: "—", time: "—", description: "Awaiting customs processing at destination.", completed: false },
    { status: "Out for Delivery", location: "London, UK", date: "—", time: "—", description: "Package dispatched to final delivery address.", completed: false },
    { status: "Delivered", location: "London, UK", date: "—", time: "—", description: "Package delivered to recipient.", completed: false },
  ] as TrackingEvent[],
};

const ShipmentTracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<typeof MOCK_SHIPMENT | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null);

  // Realtime subscription for the currently tracked shipment
  useEffect(() => {
    if (!activeTrackingNumber) return;

    const channel = supabase
      .channel(`shipment-${activeTrackingNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `tracking_number=eq.${activeTrackingNumber}`,
        },
        (payload) => {
          const data = payload.new as any;
          setShipment((prev) =>
            prev
              ? {
                  ...prev,
                  status: data.status === "delivered" ? "Delivered" : data.status === "customs" ? "Customs" : "In Transit",
                  progress: data.progress,
                  eta: data.eta || "TBD",
                  origin: data.origin,
                  destination: data.destination,
                  weight: data.weight || "N/A",
                }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTrackingNumber]);

  const handleTrack = async () => {
    if (!trackingId.trim()) return;
    setLoading(true);
    
    const normalizedId = trackingId.trim().toUpperCase();
    const { data } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", normalizedId)
      .maybeSingle();
    
    if (data) {
      setActiveTrackingNumber(data.tracking_number);
      setShipment({
        ...MOCK_SHIPMENT,
        id: data.tracking_number,
        origin: data.origin,
        destination: data.destination,
        weight: data.weight || "N/A",
        status: data.status === "delivered" ? "Delivered" : data.status === "customs" ? "Customs" : "In Transit",
        progress: data.progress,
        eta: data.eta || "TBD",
      });
    } else {
      setActiveTrackingNumber(null);
      setShipment({ ...MOCK_SHIPMENT, id: normalizedId || MOCK_SHIPMENT.id });
    }
    setLoading(false);
  };

  const ModeIcon = shipment?.modeIcon || Package;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Search */}
        <section className="relative pt-32 pb-24 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-secondary blur-[140px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground leading-tight mb-4">
                Track Your <span className="text-gradient-accent">Shipment</span>
              </h1>
              <p className="text-primary-foreground/70 text-lg mb-8">
                Enter your tracking ID to get real-time updates on your package location and delivery status.
              </p>
              <div className="flex gap-3 max-w-lg mx-auto">
                <Input
                  placeholder="Enter Tracking ID (e.g., AWL-2024-00847)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="flex-1 h-14 text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
                <Button variant="accent" size="lg" onClick={handleTrack} disabled={loading} className="h-14 px-6">
                  {loading ? <Clock className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Track</>}
                </Button>
              </div>
              <p className="text-primary-foreground/50 text-sm mt-4">No account needed — track as a guest</p>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence>
          {shipment && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-16"
            >
              <div className="container max-w-4xl">
                {/* Summary Card */}
                <div className="bg-card rounded-2xl border shadow-card overflow-hidden mb-8">
                  <div className="bg-primary/5 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ModeIcon className="w-5 h-5 text-primary" />
                      <span className="font-display font-bold text-foreground">{shipment.id}</span>
                    </div>
                    <Badge className="bg-accent/10 text-accent-foreground border-accent/20 gap-1 w-fit">
                      <Truck className="w-3 h-3" />
                      {shipment.status}
                    </Badge>
                  </div>

                  <div className="p-6">
                    {/* Route */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center flex-1">
                        <MapPin className="w-5 h-5 text-secondary mx-auto mb-1" />
                        <p className="font-semibold text-foreground text-sm">{shipment.origin}</p>
                        <p className="text-xs text-muted-foreground">Origin</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-secondary/30 relative">
                        <ArrowRight className="w-5 h-5 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card" />
                      </div>
                      <div className="text-center flex-1">
                        <MapPin className="w-5 h-5 text-accent mx-auto mb-1" />
                        <p className="font-semibold text-foreground text-sm">{shipment.destination}</p>
                        <p className="text-xs text-muted-foreground">Destination</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${shipment.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "var(--gradient-primary)" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-right">{shipment.progress}% complete</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: Plane, label: "Mode", value: shipment.mode },
                        { icon: Weight, label: "Weight", value: shipment.weight },
                        { icon: Box, label: "Pieces", value: shipment.pieces },
                        { icon: Calendar, label: "ETA", value: shipment.eta },
                      ].map((d) => (
                        <div key={d.label} className="bg-muted rounded-xl p-3 text-center">
                          <d.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">{d.label}</p>
                          <p className="text-sm font-semibold text-foreground">{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-2xl border shadow-card p-6 mb-8">
                  <h3 className="font-display font-bold text-foreground text-lg mb-6">Tracking Timeline</h3>
                  <div className="space-y-0">
                    {shipment.events.map((event, i) => (
                      <div key={event.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                            event.current
                              ? "bg-accent border-accent ring-4 ring-accent/20"
                              : event.completed
                              ? "bg-secondary border-secondary"
                              : "bg-card border-border"
                          }`} />
                          {i < shipment.events.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[48px] ${event.completed ? "bg-secondary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pb-8 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${event.completed ? "text-foreground" : "text-muted-foreground"}`}>
                              {event.status}
                            </p>
                            {event.current && (
                              <Badge className="bg-accent/10 text-accent-foreground border-accent/20 text-[10px] px-1.5 py-0">Current</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {event.date} {event.time !== "—" && `at ${event.time}`}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Proof & Notifications */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-card rounded-2xl border shadow-card p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" /> Delivery Proof
                    </h3>
                    <div className="bg-muted rounded-xl p-8 text-center">
                      <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Delivery photo will appear here once the package is delivered.</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border shadow-card p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" /> Get Alerts
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Receive SMS and email notifications for status changes.</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input placeholder="Email address" className="h-10" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input placeholder="Phone number" className="h-10" />
                      </div>
                      <Button variant="accent" className="w-full">Subscribe to Alerts</Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state when no shipment tracked yet */}
        {!shipment && (
          <section className="py-24">
            <div className="container">
              <motion.div {...fadeUp} className="text-center max-w-xl mx-auto">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">Enter a Tracking ID Above</h2>
                <p className="text-muted-foreground">
                  Your shipment details, real-time timeline, and delivery proof will appear here.
                </p>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShipmentTracking;
