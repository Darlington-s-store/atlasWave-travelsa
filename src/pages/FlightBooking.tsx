import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane, MapPin, Calendar, Users, ArrowRight, ArrowLeftRight, CheckCircle2,
  Clock, Filter, SortAsc, CreditCard, User, Luggage, ChevronDown, X, Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const airports = [
  "Accra (ACC)", "Lagos (LOS)", "Nairobi (NBO)", "London Heathrow (LHR)", "London Gatwick (LGW)",
  "New York JFK (JFK)", "Dubai (DXB)", "Toronto (YYZ)", "Frankfurt (FRA)", "Paris CDG (CDG)",
  "Amsterdam (AMS)", "Istanbul (IST)", "Johannesburg (JNB)", "Cairo (CAI)", "Casablanca (CMN)",
];

const MOCK_RESULTS = [
  { id: 1, airline: "Turkish Airlines", logo: "TK", from: "Accra (ACC)", to: "London (LHR)", depart: "08:30", arrive: "16:45", duration: "8h 15m", stops: 1, stopCity: "Istanbul", price: 520, cabin: "Economy", baggage: "23kg", refundable: false },
  { id: 2, airline: "Emirates", logo: "EK", from: "Accra (ACC)", to: "London (LHR)", depart: "22:15", arrive: "10:30+1", duration: "12h 15m", stops: 1, stopCity: "Dubai", price: 680, cabin: "Economy", baggage: "30kg", refundable: true },
  { id: 3, airline: "British Airways", logo: "BA", from: "Accra (ACC)", to: "London (LHR)", depart: "23:00", arrive: "05:30+1", duration: "6h 30m", stops: 0, stopCity: "", price: 750, cabin: "Economy", baggage: "23kg", refundable: true },
  { id: 4, airline: "KLM", logo: "KL", from: "Accra (ACC)", to: "London (LHR)", depart: "10:45", arrive: "22:10", duration: "11h 25m", stops: 1, stopCity: "Amsterdam", price: 490, cabin: "Economy", baggage: "23kg", refundable: false },
  { id: 5, airline: "Ethiopian Airlines", logo: "ET", from: "Accra (ACC)", to: "London (LHR)", depart: "14:00", arrive: "06:15+1", duration: "16h 15m", stops: 2, stopCity: "Addis Ababa, Rome", price: 420, cabin: "Economy", baggage: "23kg", refundable: false },
  { id: 6, airline: "Qatar Airways", logo: "QR", from: "Accra (ACC)", to: "London (LHR)", depart: "01:30", arrive: "14:00", duration: "12h 30m", stops: 1, stopCity: "Doha", price: 710, cabin: "Economy", baggage: "30kg", refundable: true },
];

const FlightBooking = () => {
  const [tripType, setTripType] = useState("round-trip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabin, setCabin] = useState("economy");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");
  const [filterStops, setFilterStops] = useState<string>("all");
  const [filterAirline, setFilterAirline] = useState<string>("all");
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState<"search" | "details" | "confirm">("search");

  const handleAutocomplete = (value: string, setter: (v: string) => void, setSuggestions: (s: string[]) => void) => {
    setter(value);
    if (value.length >= 2) {
      setSuggestions(airports.filter((a) => a.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const sortedResults = useMemo(() => {
    let results = [...MOCK_RESULTS];
    if (filterStops !== "all") {
      const max = filterStops === "direct" ? 0 : filterStops === "1" ? 1 : 3;
      results = results.filter((r) => r.stops <= max);
    }
    if (filterAirline !== "all") results = results.filter((r) => r.airline === filterAirline);
    results.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "duration") return a.duration.localeCompare(b.duration);
      return a.depart.localeCompare(b.depart);
    });
    return results;
  }, [sortBy, filterStops, filterAirline]);

  const handleSearch = () => {
    setShowResults(true);
    setBookingStep("search");
    setSelectedFlight(null);
  };

  const handleSelectFlight = (id: number) => {
    setSelectedFlight(id);
    setBookingStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selected = MOCK_RESULTS.find((r) => r.id === selectedFlight);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-accent blur-[120px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <Plane className="w-4 h-4 inline mr-2" />Flight Booking
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Book Your <span className="text-gradient-accent">Perfect Flight</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl">
                Access competitive fares on 500+ airlines worldwide with personalized booking assistance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Card */}
        <section className="py-8">
          <div className="container max-w-5xl">
            <motion.div {...fadeUp} className="bg-card rounded-2xl p-6 md:p-8 border shadow-card -mt-16 relative z-20">
              {/* Trip Type */}
              <div className="flex gap-2 mb-6">
                {[
                  { value: "one-way", label: "One-Way" },
                  { value: "round-trip", label: "Round-Trip" },
                  { value: "multi-city", label: "Multi-City" },
                ].map((t) => (
                  <Button key={t.value} variant={tripType === t.value ? "default" : "outline"} size="sm" onClick={() => setTripType(t.value)} className="text-xs">
                    {t.label}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* From */}
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Departure city" className="pl-10 h-12" value={from} onChange={(e) => handleAutocomplete(e.target.value, setFrom, setFromSuggestions)} />
                  </div>
                  {fromSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-card border rounded-lg shadow-lg mt-1 z-30 overflow-hidden">
                      {fromSuggestions.map((s) => (
                        <button key={s} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => { setFrom(s); setFromSuggestions([]); }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap + To */}
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Destination" className="pl-10 h-12" value={to} onChange={(e) => handleAutocomplete(e.target.value, setTo, setToSuggestions)} />
                  </div>
                  {toSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-card border rounded-lg shadow-lg mt-1 z-30 overflow-hidden">
                      {toSuggestions.map((s) => (
                        <button key={s} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => { setTo(s); setToSuggestions([]); }}>{s}</button>
                      ))}
                    </div>
                  )}
                  {/* Swap button */}
                  <button className="absolute -left-5 top-8 z-10 w-8 h-8 rounded-full bg-card border shadow-sm flex items-center justify-center hover:bg-muted transition-colors hidden md:flex" onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}>
                    <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>

                {/* Dates */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-12" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
                  </div>
                </div>
                {tripType === "round-trip" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Return</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="pl-10 h-12" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="w-32">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Passengers</label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n} Pax</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Cabin</label>
                  <Select value={cabin} onValueChange={setCabin}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="accent" className="h-12 flex-1 min-w-[140px]" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" /> Search Flights
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Booking Details (after selecting a flight) */}
        <AnimatePresence>
          {bookingStep === "details" && selected && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-8">
              <div className="container max-w-4xl">
                <Button variant="ghost" size="sm" onClick={() => setBookingStep("search")} className="mb-4">
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to results
                </Button>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Passenger Form */}
                  <div className="lg:col-span-2 bg-card rounded-2xl border shadow-card p-6">
                    <h3 className="text-xl font-display font-bold text-card-foreground mb-6">Passenger Details</h3>
                    {Array.from({ length: parseInt(passengers) }).map((_, i) => (
                      <div key={i} className="mb-6 pb-6 border-b last:border-0 last:mb-0 last:pb-0">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> Passenger {i + 1}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">First Name</Label>
                            <Input placeholder="John" className="h-10" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Last Name</Label>
                            <Input placeholder="Doe" className="h-10" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Passport Number</Label>
                            <Input placeholder="A12345678" className="h-10" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input type="date" className="h-10" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input placeholder="Email address" className="h-10" />
                        <Input placeholder="Phone number" className="h-10" />
                      </div>
                    </div>
                    <Button variant="accent" className="w-full mt-6 h-12" onClick={() => { setBookingStep("confirm"); toast({ title: "Booking Confirmed!", description: `Your ${selected.airline} flight has been booked.` }); }}>
                      Confirm & Pay ${selected.price * parseInt(passengers)} <CreditCard className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Flight Summary */}
                  <div className="bg-card rounded-2xl border shadow-card p-6 h-fit sticky top-24">
                    <h4 className="font-display font-bold text-foreground mb-4">Flight Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">{selected.logo}</div>
                        <div>
                          <p className="font-semibold text-foreground">{selected.airline}</p>
                          <p className="text-xs text-muted-foreground">{selected.cabin}</p>
                        </div>
                      </div>
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="text-foreground font-medium">{selected.from.split(" ")[0]} → {selected.to.split(" ")[0]}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selected.depart} — {selected.arrive}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-foreground">{selected.duration}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Stops</span><span className="text-foreground">{selected.stops === 0 ? "Direct" : `${selected.stops} stop`}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Baggage</span><span className="text-foreground">{selected.baggage}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Passengers</span><span className="text-foreground">{passengers}</span></div>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-display font-bold text-accent">${selected.price * parseInt(passengers)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Search Results */}
        {showResults && bookingStep === "search" && (
          <section className="py-8 pb-16">
            <div className="container max-w-5xl">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="w-4 h-4" /> Stops:
                </div>
                {[
                  { value: "all", label: "All" },
                  { value: "direct", label: "Direct" },
                  { value: "1", label: "1 Stop" },
                ].map((f) => (
                  <Button key={f.value} variant={filterStops === f.value ? "default" : "outline"} size="sm" className="text-xs h-8" onClick={() => setFilterStops(f.value)}>
                    {f.label}
                  </Button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                  <SortAsc className="w-4 h-4" /> Sort:
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{sortedResults.length} flights found</p>

              <div className="space-y-3">
                {sortedResults.map((flight) => (
                  <motion.div key={flight.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border shadow-sm hover:shadow-card transition-shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-primary text-sm">{flight.logo}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm">{flight.airline}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-lg font-display font-bold text-foreground">{flight.depart}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="w-2 h-2 rounded-full bg-secondary" />
                              <div className="w-16 border-t border-dashed border-muted-foreground relative">
                                {flight.stops > 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-accent font-medium">{flight.stops} stop</span>}
                              </div>
                              <div className="w-2 h-2 rounded-full bg-accent" />
                            </div>
                            <span className="text-lg font-display font-bold text-foreground">{flight.arrive}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{flight.duration} {flight.stopCity && `· via ${flight.stopCity}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[10px]">{flight.baggage}</Badge>
                          {flight.refundable && <Badge variant="outline" className="text-[10px] bg-secondary/10 text-secondary border-secondary/20">Refundable</Badge>}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-accent">${flight.price}</p>
                          <p className="text-xs text-muted-foreground">per person</p>
                        </div>
                        <Button variant="accent" size="sm" onClick={() => handleSelectFlight(flight.id)}>
                          Select <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Routes (shown before search) */}
        {!showResults && (
          <section className="py-16 bg-muted">
            <div className="container">
              <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
                Popular <span className="text-gradient-accent">Routes</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { from: "Lagos", to: "London", price: "$450", airline: "Turkish Airlines" },
                  { from: "Accra", to: "New York", price: "$680", airline: "Emirates" },
                  { from: "Nairobi", to: "Dubai", price: "$380", airline: "Qatar Airways" },
                  { from: "Lagos", to: "Johannesburg", price: "$320", airline: "Ethiopian Airlines" },
                  { from: "Accra", to: "Toronto", price: "$720", airline: "KLM" },
                  { from: "Lagos", to: "Frankfurt", price: "$520", airline: "Lufthansa" },
                ].map((r, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-foreground font-semibold">{r.from}</span>
                      <ArrowRight className="w-4 h-4 text-accent" />
                      <span className="text-foreground font-semibold">{r.to}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.airline}</p>
                    <p className="text-2xl font-bold text-accent mt-2">From {r.price}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FlightBooking;
