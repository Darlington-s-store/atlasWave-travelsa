import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
  Weight,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

type ShipmentRow = {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  eta: string | null;
  progress: number;
  status: string;
  weight: string | null;
};

type ShipmentEventRow = {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  description: string;
  occurred_at: string;
  sort_order: number;
};

const formatEventDate = (value: string) => {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
};

const formatShipmentStatus = (status: string) =>
  status
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ShipmentTracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<ShipmentRow | null>(null);
  const [events, setEvents] = useState<ShipmentEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTrackingNumber) return;

    const shipmentChannel = supabase
      .channel(`shipment-${activeTrackingNumber}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shipments",
          filter: `tracking_number=eq.${activeTrackingNumber}`,
        },
        (payload) => {
          setShipment(payload.new as ShipmentRow);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(shipmentChannel);
    };
  }, [activeTrackingNumber]);

  const handleTrack = async () => {
    if (!trackingId.trim()) return;

    setLoading(true);
    setNotFound(false);

    const normalizedId = trackingId.trim().toUpperCase();
    const { data: shipmentData } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", normalizedId)
      .maybeSingle();

    if (!shipmentData) {
      setActiveTrackingNumber(null);
      setShipment(null);
      setEvents([]);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const currentShipment = shipmentData as ShipmentRow;
    setShipment(currentShipment);
    setActiveTrackingNumber(currentShipment.tracking_number);

    const { data: eventData } = await (supabase as any)
      .from("shipment_events")
      .select("*")
      .eq("shipment_id", currentShipment.id)
      .order("sort_order", { ascending: true })
      .order("occurred_at", { ascending: true });

    setEvents((eventData || []) as ShipmentEventRow[]);
    setLoading(false);
  };

  const timeline = useMemo(
    () =>
      events.map((event, index) => {
        const { date, time } = formatEventDate(event.occurred_at);
        return {
          ...event,
          date,
          time,
          completed: true,
          current: index === events.length - 1,
        };
      }),
    [events],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative bg-primary pb-24 pt-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-20 top-10 h-80 w-80 rounded-full bg-secondary blur-[140px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
                <Package className="h-8 w-8 text-accent" />
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
                Track Your <span className="text-gradient-accent">Shipment</span>
              </h1>
              <p className="mb-8 text-lg text-primary-foreground/70">
                Enter your tracking ID to get live updates from Supabase shipment records.
              </p>
              <div className="mx-auto flex max-w-lg gap-3">
                <Input
                  placeholder="Enter Tracking ID (e.g., AWL-2024-00847)"
                  value={trackingId}
                  onChange={(event) => setTrackingId(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleTrack()}
                  className="h-14 flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-base text-primary-foreground placeholder:text-primary-foreground/40"
                />
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleTrack}
                  disabled={loading}
                  className="h-14 px-6"
                >
                  {loading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/50">No account needed.</p>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {shipment && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-16"
            >
              <div className="container max-w-4xl">
                <div className="mb-8 overflow-hidden rounded-2xl border bg-card shadow-card">
                  <div className="flex flex-col justify-between gap-3 border-b bg-primary/5 px-6 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-display font-bold text-foreground">
                        {shipment.tracking_number}
                      </span>
                    </div>
                    <Badge className="w-fit gap-1 border-accent/20 bg-accent/10 text-accent-foreground">
                      <Truck className="h-3 w-3" />
                      {formatShipmentStatus(shipment.status)}
                    </Badge>
                  </div>

                  <div className="p-6">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex-1 text-center">
                        <MapPin className="mx-auto mb-1 h-5 w-5 text-secondary" />
                        <p className="text-sm font-semibold text-foreground">{shipment.origin}</p>
                        <p className="text-xs text-muted-foreground">Origin</p>
                      </div>
                      <div className="relative flex-1 border-t-2 border-dashed border-secondary/30">
                        <ArrowRight className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 bg-card text-secondary" />
                      </div>
                      <div className="flex-1 text-center">
                        <MapPin className="mx-auto mb-1 h-5 w-5 text-accent" />
                        <p className="text-sm font-semibold text-foreground">{shipment.destination}</p>
                        <p className="text-xs text-muted-foreground">Destination</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${shipment.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "var(--gradient-primary)" }}
                        />
                      </div>
                      <p className="mt-2 text-right text-xs text-muted-foreground">
                        {shipment.progress}% complete
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[
                        { icon: Weight, label: "Weight", value: shipment.weight || "Not provided" },
                        { icon: Calendar, label: "ETA", value: shipment.eta || "Not provided" },
                        {
                          icon: CheckCircle2,
                          label: "Events",
                          value: `${timeline.length} update${timeline.length === 1 ? "" : "s"}`,
                        },
                      ].map((detail) => (
                        <div key={detail.label} className="rounded-xl bg-muted p-3 text-center">
                          <detail.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{detail.label}</p>
                          <p className="text-sm font-semibold text-foreground">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-8 rounded-2xl border bg-card p-6 shadow-card">
                  <h3 className="mb-6 font-display text-lg font-bold text-foreground">
                    Tracking Timeline
                  </h3>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No shipment events have been added yet for this tracking number.
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {timeline.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                                event.current
                                  ? "border-accent bg-accent ring-4 ring-accent/20"
                                  : "border-secondary bg-secondary"
                              }`}
                            />
                            {index < timeline.length - 1 && (
                              <div className="min-h-[48px] w-0.5 flex-1 bg-secondary" />
                            )}
                          </div>
                          <div className="min-w-0 pb-8">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{event.status}</p>
                              {event.current ? (
                                <Badge className="border-accent/20 bg-accent/10 px-1.5 py-0 text-[10px] text-accent-foreground">
                                  Current
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {event.date} at {event.time}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-card p-6 shadow-card">
                    <h3 className="mb-4 flex items-center gap-2 font-display font-bold text-foreground">
                      <Camera className="h-5 w-5 text-primary" />
                      Delivery Proof
                    </h3>
                    <div className="rounded-xl bg-muted p-8 text-center">
                      <Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Delivery proof can be attached later from the admin shipment workflow.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-card p-6 shadow-card">
                    <h3 className="mb-4 flex items-center gap-2 font-display font-bold text-foreground">
                      <Mail className="h-5 w-5 text-primary" />
                      Get Alerts
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Subscribe for shipment notifications.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input placeholder="Email address" className="h-10" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input placeholder="Phone number" className="h-10" />
                      </div>
                      <Button variant="accent" className="w-full">
                        Subscribe to Alerts
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {!shipment && (
          <section className="py-24">
            <div className="container">
              <motion.div {...fadeUp} className="mx-auto max-w-xl text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
                <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
                  {notFound ? "Tracking Number Not Found" : "Enter a Tracking ID Above"}
                </h2>
                <p className="text-muted-foreground">
                  {notFound
                    ? "We could not find a shipment with that tracking number in Supabase."
                    : "Your shipment details and timeline will appear here."}
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
