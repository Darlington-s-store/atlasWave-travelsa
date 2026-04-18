import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  CreditCard,
  Filter,
  MapPin,
  Plane,
  Search,
  SortAsc,
  User,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

type FlightOffer = {
  id: string;
  airline: string;
  logo: string | null;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: number;
  stop_city: string | null;
  price: number;
  cabin: string;
  baggage: string | null;
  refundable: boolean;
  featured: boolean;
};

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
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<"search" | "details" | "confirm">("search");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      const { data } = await (supabase as any)
        .from("flight_offers" as never)
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true });

      setOffers(((data || []) as FlightOffer[]).map((offer) => ({ ...offer, price: Number(offer.price) })));
      setLoadingOffers(false);
    };

    loadOffers();
  }, []);

  const airports = useMemo(
    () =>
      Array.from(
        new Set(
          offers.flatMap((offer) => [offer.origin, offer.destination]).filter(Boolean),
        ),
      ),
    [offers],
  );

  const handleAutocomplete = (
    value: string,
    setter: (value: string) => void,
    setSuggestions: (value: string[]) => void,
  ) => {
    setter(value);
    if (value.length >= 2) {
      setSuggestions(
        airports.filter((airport) => airport.toLowerCase().includes(value.toLowerCase())).slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const sortedResults = useMemo(() => {
    let results = [...offers];

    if (from.trim()) {
      results = results.filter((result) => result.origin.toLowerCase().includes(from.toLowerCase()));
    }

    if (to.trim()) {
      results = results.filter((result) =>
        result.destination.toLowerCase().includes(to.toLowerCase()),
      );
    }

    if (cabin !== "economy") {
      results = results.filter((result) => result.cabin.toLowerCase() === cabin.toLowerCase());
    }

    if (filterStops !== "all") {
      const max = filterStops === "direct" ? 0 : filterStops === "1" ? 1 : 3;
      results = results.filter((result) => result.stops <= max);
    }

    results.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "duration") return a.duration.localeCompare(b.duration);
      return a.departure_time.localeCompare(b.departure_time);
    });

    return results;
  }, [offers, from, to, cabin, filterStops, sortBy]);

  const popularRoutes = useMemo(
    () =>
      offers
        .filter((offer) => offer.featured)
        .slice(0, 6)
        .map((offer) => ({
          from: offer.origin.split(" (")[0],
          to: offer.destination.split(" (")[0],
          price: formatCurrency(offer.price, DEFAULT_CURRENCY),
          airline: offer.airline,
        })),
    [offers],
  );

  const handleSearch = () => {
    setShowResults(true);
    setBookingStep("search");
    setSelectedFlight(null);
  };

  const handleSelectFlight = (id: string) => {
    setSelectedFlight(id);
    setBookingStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selected = offers.find((result) => result.id === selectedFlight);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero
          badge="Flight Booking"
          badgeIcon={Plane}
          title="Book Your"
          highlight="Perfect Flight"
          description="Compare global airlines, secure the best fares, and travel with confidence. Live offers updated daily by our travel desk."
          backgroundImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=70&auto=format&fit=crop"
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Travel Services", to: "/travel" }, { label: "Flights" }]}
          stats={[
            { value: "500+", label: "Airlines", icon: Plane },
            { value: "24/7", label: "Travel support", icon: User },
            { value: "0%", label: "Booking fee", icon: CreditCard },
            { value: "Best", label: "Price guarantee", icon: SortAsc },
          ]}
        />

        <section className="py-8">
          <div className="container max-w-5xl">
            <motion.div
              {...fadeUp}
              className="relative z-20 -mt-12 rounded-2xl border bg-card p-4 shadow-card sm:-mt-16 sm:p-6 md:p-8"
            >
              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { value: "one-way", label: "One-Way" },
                  { value: "round-trip", label: "Round-Trip" },
                  { value: "multi-city", label: "Multi-City" },
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={tripType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTripType(type.value)}
                    className="min-w-[110px] flex-1 text-xs sm:flex-none"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Departure city"
                      className="h-12 pl-10"
                      value={from}
                      onChange={(event) =>
                        handleAutocomplete(event.target.value, setFrom, setFromSuggestions)
                      }
                    />
                  </div>
                  {fromSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border bg-card shadow-lg">
                      {fromSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                          onClick={() => {
                            setFrom(suggestion);
                            setFromSuggestions([]);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Destination"
                      className="h-12 pl-10"
                      value={to}
                      onChange={(event) =>
                        handleAutocomplete(event.target.value, setTo, setToSuggestions)
                      }
                    />
                  </div>
                  {toSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border bg-card shadow-lg">
                      {toSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                          onClick={() => {
                            setTo(suggestion);
                            setToSuggestions([]);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className="absolute -left-5 top-8 z-10 hidden h-8 w-8 items-center justify-center rounded-full border bg-card shadow-sm transition-colors hover:bg-muted md:flex"
                    onClick={() => {
                      const temp = from;
                      setFrom(to);
                      setTo(temp);
                    }}
                  >
                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Departure
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="h-12 pl-10"
                      value={departDate}
                      onChange={(event) => setDepartDate(event.target.value)}
                    />
                  </div>
                </div>

                {tripType === "round-trip" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Return
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        className="h-12 pl-10"
                        value={returnDate}
                        onChange={(event) => setReturnDate(event.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[128px_144px_minmax(0,1fr)] lg:items-end">
                <div className="w-full">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Passengers
                  </label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((number) => (
                        <SelectItem key={number} value={String(number)}>
                          {number} Pax
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Cabin</label>
                  <Select value={cabin} onValueChange={setCabin}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="accent" className="h-12 w-full lg:min-w-[180px]" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Flights
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {bookingStep === "details" && selected && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="container max-w-4xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBookingStep("search")}
                  className="mb-4"
                >
                  <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
                  Back to results
                </Button>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
                    <h3 className="mb-6 font-display text-xl font-bold text-card-foreground">
                      Passenger Details
                    </h3>
                    {Array.from({ length: parseInt(passengers, 10) }).map((_, index) => (
                      <div
                        key={index}
                        className="mb-6 border-b pb-6 last:mb-0 last:border-0 last:pb-0"
                      >
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <User className="h-4 w-4 text-primary" />
                          Passenger {index + 1}
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="Email address" className="h-10" />
                        <Input placeholder="Phone number" className="h-10" />
                      </div>
                    </div>

                    <Button
                      variant="accent"
                      className="mt-6 h-12 w-full"
                      onClick={() => {
                        setBookingStep("confirm");
                        toast({
                          title: "Booking Confirmed!",
                          description: `Your ${selected.airline} flight has been booked.`,
                        });
                      }}
                    >
                      Confirm & Pay{" "}
                      {formatCurrency(selected.price * parseInt(passengers, 10), DEFAULT_CURRENCY)}
                      <CreditCard className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="order-first h-fit rounded-2xl border bg-card p-6 shadow-card lg:order-none lg:sticky lg:top-24">
                    <h4 className="mb-4 font-display font-bold text-foreground">Flight Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {selected.logo || selected.airline.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{selected.airline}</p>
                          <p className="text-xs text-muted-foreground">{selected.cabin}</p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Route</span>
                          <span className="text-right font-medium text-foreground">
                            {selected.origin.split(" ")[0]} to {selected.destination.split(" ")[0]}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Time</span>
                          <span className="text-right text-foreground">
                            {selected.departure_time} - {selected.arrival_time}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="text-right text-foreground">{selected.duration}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Stops</span>
                          <span className="text-right text-foreground">
                            {selected.stops === 0 ? "Direct" : `${selected.stops} stop`}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Baggage</span>
                          <span className="text-right text-foreground">
                            {selected.baggage || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Passengers</span>
                          <span className="text-right text-foreground">{passengers}</span>
                        </div>
                      </div>

                      <div className="flex justify-between border-t pt-3">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-display text-xl font-bold text-accent">
                          {formatCurrency(selected.price * parseInt(passengers, 10), DEFAULT_CURRENCY)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {showResults && bookingStep === "search" && (
          <section className="pb-16 pt-8">
            <div className="container max-w-5xl">
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Stops:
                </div>
                {[
                  { value: "all", label: "All" },
                  { value: "direct", label: "Direct" },
                  { value: "1", label: "1 Stop" },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterStops === filter.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setFilterStops(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}

                <div className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
                  <SortAsc className="h-4 w-4" />
                  Sort:
                </div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="h-9 w-full text-xs sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">{sortedResults.length} flights found</p>

              {sortedResults.length === 0 ? (
                <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
                  No flight offers matched your search. Add offers in Supabase to populate this page.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedResults.map((flight) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-card sm:p-5"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                            <span className="text-sm font-bold text-primary">
                              {flight.logo || flight.airline.slice(0, 2).toUpperCase()}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{flight.airline}</p>
                            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center sm:flex sm:items-center sm:gap-3 sm:text-left">
                              <span className="font-display text-base font-bold text-foreground sm:text-lg">
                                {flight.departure_time}
                              </span>
                              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-secondary" />
                                  <div className="relative w-12 border-t border-dashed border-muted-foreground sm:w-16">
                                    {flight.stops > 0 && (
                                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-medium text-accent">
                                        {flight.stops} stop
                                      </span>
                                    )}
                                  </div>
                                  <div className="h-2 w-2 rounded-full bg-accent" />
                                </div>
                                <span className="text-[11px]">{flight.duration}</span>
                              </div>
                              <span className="font-display text-base font-bold text-foreground sm:text-lg">
                                {flight.arrival_time}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {flight.stop_city ? `Via ${flight.stop_city}` : "Direct flight"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between lg:w-[260px] lg:border-t-0 lg:pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {flight.baggage ? (
                              <Badge variant="outline" className="text-[10px]">
                                {flight.baggage}
                              </Badge>
                            ) : null}
                            {flight.refundable ? (
                              <Badge
                                variant="outline"
                                className="border-secondary/20 bg-secondary/10 text-[10px] text-secondary"
                              >
                                Refundable
                              </Badge>
                            ) : null}
                          </div>

                          <div className="sm:text-right">
                            <p className="font-display text-xl font-bold text-accent sm:text-2xl">
                              {formatCurrency(flight.price, DEFAULT_CURRENCY)}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>

                          <Button
                            variant="accent"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleSelectFlight(flight.id)}
                          >
                            Select
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!showResults && (
          <section className="bg-muted py-16">
            <div className="container">
              <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">
                Popular <span className="text-gradient-accent">Routes</span>
              </h2>
              {loadingOffers ? (
                <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
                  Loading flight offers...
                </div>
              ) : popularRoutes.length === 0 ? (
                <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
                  No featured flight offers have been published yet.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {popularRoutes.map((route, index) => (
                    <motion.div
                      key={`${route.from}-${route.to}-${index}`}
                      {...fadeUp}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover sm:p-6"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className="font-semibold text-foreground">{route.from}</span>
                        <ArrowRight className="h-4 w-4 text-accent" />
                        <span className="font-semibold text-foreground">{route.to}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{route.airline}</p>
                      <p className="mt-2 text-2xl font-bold text-accent">From {route.price}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FlightBooking;
