import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Hotel, MapPin, Star, CheckCircle2, Wifi, Car, Coffee, Waves, Dumbbell,
  Search, Filter, SortAsc, ArrowRight, User, CreditCard, Phone, Grid, List,
  UtensilsCrossed, ShieldCheck, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const amenityIcons: Record<string, any> = { WiFi: Wifi, Pool: Waves, Spa: Coffee, Gym: Dumbbell, Parking: Car, Restaurant: UtensilsCrossed, Bar: Coffee, Beach: Waves, Lounge: Coffee };

const MOCK_HOTELS = [
  { id: 1, name: "Grand Marriott Istanbul", location: "Istanbul, Turkey", rating: 5, reviews: 1284, price: 120, originalPrice: 160, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"], roomTypes: [{ type: "Deluxe Room", beds: "1 King", size: "35m²", price: 120 }, { type: "Executive Suite", beds: "1 King + Sofa", size: "55m²", price: 220 }, { type: "Family Room", beds: "2 Queens", size: "45m²", price: 180 }] },
  { id: 2, name: "Hilton Dubai Creek", location: "Dubai, UAE", rating: 5, reviews: 2150, price: 180, originalPrice: 240, amenities: ["WiFi", "Beach", "Gym", "Pool", "Restaurant"], roomTypes: [{ type: "Standard Room", beds: "1 Queen", size: "30m²", price: 180 }, { type: "Creek View Suite", beds: "1 King", size: "60m²", price: 350 }] },
  { id: 3, name: "Kempinski Accra", location: "Accra, Ghana", rating: 5, reviews: 890, price: 150, originalPrice: 190, amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Bar"], roomTypes: [{ type: "Superior Room", beds: "1 King", size: "38m²", price: 150 }, { type: "Presidential Suite", beds: "1 King + Living", size: "90m²", price: 450 }] },
  { id: 4, name: "Radisson Blu Lagos", location: "Lagos, Nigeria", rating: 4, reviews: 654, price: 95, originalPrice: 120, amenities: ["WiFi", "Bar", "Parking", "Gym"], roomTypes: [{ type: "Standard Room", beds: "1 Queen", size: "28m²", price: 95 }, { type: "Business Room", beds: "1 King", size: "35m²", price: 140 }] },
  { id: 5, name: "InterContinental Nairobi", location: "Nairobi, Kenya", rating: 4, reviews: 1102, price: 110, originalPrice: 145, amenities: ["WiFi", "Spa", "Lounge", "Restaurant"], roomTypes: [{ type: "Classic Room", beds: "1 King", size: "32m²", price: 110 }, { type: "Club Suite", beds: "1 King", size: "50m²", price: 230 }] },
  { id: 6, name: "Movenpick Johannesburg", location: "Johannesburg, SA", rating: 4, reviews: 780, price: 85, originalPrice: 110, amenities: ["WiFi", "Pool", "Gym", "Parking"], roomTypes: [{ type: "Superior Room", beds: "1 Queen", size: "30m²", price: 85 }, { type: "Junior Suite", beds: "1 King", size: "42m²", price: 160 }] },
];

const destinations = ["All", "Istanbul", "Dubai", "Accra", "Lagos", "Nairobi", "Johannesburg"];

const HotelAccommodation = () => {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<"browse" | "rooms" | "guest" | "confirm">("browse");

  const sortedHotels = useMemo(() => {
    let hotels = [...MOCK_HOTELS];
    if (filterRating !== "all") hotels = hotels.filter((h) => h.rating >= parseInt(filterRating));
    hotels.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });
    return hotels;
  }, [sortBy, filterRating]);

  const hotel = MOCK_HOTELS.find((h) => h.id === selectedHotel);
  const room = hotel?.roomTypes.find((r) => r.type === selectedRoom);
  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 3;

  const handleSearch = () => { setShowResults(true); setBookingStep("browse"); setSelectedHotel(null); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-20 w-80 h-80 rounded-full bg-secondary blur-[140px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <Hotel className="w-4 h-4 inline mr-2" />Hotels & Accommodation
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Premium <span className="text-gradient-accent">Stays</span> Worldwide
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl">
                Curated hotels and accommodations across 100+ destinations at the best rates.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search */}
        <section className="py-8">
          <div className="container max-w-5xl">
            <motion.div {...fadeUp} className="bg-card rounded-2xl p-6 md:p-8 border shadow-card -mt-16 relative z-20">
              <h2 className="text-xl font-display font-bold text-card-foreground mb-6">Find Your Perfect Stay</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="City or hotel name" className="pl-10 h-12" value={destination} onChange={(e) => setDestination(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in</label>
                  <Input type="date" className="h-12" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out</label>
                  <Input type="date" className="h-12" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Guests</label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Rooms</label>
                    <Select value={rooms} onValueChange={setRooms}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>{[1, 2, 3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button variant="accent" className="w-full h-12" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" /> Search Hotels
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Room Selection / Guest Details */}
        <AnimatePresence>
          {bookingStep === "rooms" && hotel && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-8">
              <div className="container max-w-4xl">
                <Button variant="ghost" size="sm" onClick={() => setBookingStep("browse")} className="mb-4">
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to results
                </Button>
                <div className="bg-card rounded-2xl border shadow-card p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">{hotel.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{hotel.location}</span>
                        <div className="flex gap-0.5 ml-2">{Array.from({ length: hotel.rating }).map((_, s) => <Star key={s} className="w-3 h-3 text-accent fill-accent" />)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">{hotel.amenities.map((a) => { const Icon = amenityIcons[a] || Wifi; return <div key={a} title={a} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Icon className="w-4 h-4 text-muted-foreground" /></div>; })}</div>
                  </div>

                  <h3 className="font-display font-semibold text-foreground mt-6 mb-4">Select Room Type</h3>
                  <div className="space-y-3">
                    {hotel.roomTypes.map((rt) => (
                      <div key={rt.type} className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedRoom === rt.type ? "ring-2 ring-accent bg-accent/5" : "hover:bg-muted/50"}`} onClick={() => setSelectedRoom(rt.type)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{rt.type}</p>
                            <p className="text-sm text-muted-foreground">{rt.beds} · {rt.size}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-display font-bold text-accent">${rt.price}</p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRoom && (
                    <Button variant="accent" className="w-full mt-6 h-12" onClick={() => setBookingStep("guest")}>
                      Continue — ${room!.price * nights * parseInt(rooms)} for {nights} nights <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {bookingStep === "guest" && hotel && room && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-8">
              <div className="container max-w-4xl">
                <Button variant="ghost" size="sm" onClick={() => setBookingStep("rooms")} className="mb-4">
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to rooms
                </Button>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-card rounded-2xl border shadow-card p-6">
                    <h3 className="text-xl font-display font-bold text-card-foreground mb-6">Guest Details</h3>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input placeholder="John Doe" className="h-10" /></div>
                        <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" placeholder="john@example.com" className="h-10" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Phone</Label><Input placeholder="+233 XX XXX XXXX" className="h-10" /></div>
                        <div className="space-y-1"><Label className="text-xs">Special Requests</Label><Input placeholder="Early check-in, extra pillows..." className="h-10" /></div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mt-6 mb-3 text-sm">Payment Method</h4>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Button variant="outline" className="h-12 gap-2"><CreditCard className="w-4 h-4" /> Mastercard</Button>
                      <Button variant="outline" className="h-12 gap-2"><Phone className="w-4 h-4" /> Mobile Money</Button>
                    </div>
                    <Button variant="accent" className="w-full h-12" onClick={() => { setBookingStep("confirm"); toast({ title: "Reservation Confirmed!", description: `Your stay at ${hotel.name} has been booked.` }); }}>
                      Confirm & Pay ${room.price * nights * parseInt(rooms)} <ShieldCheck className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border shadow-card p-6 h-fit sticky top-24">
                    <h4 className="font-display font-bold text-foreground mb-4">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-foreground">{hotel.name}</p>
                      <p className="text-muted-foreground">{hotel.location}</p>
                      <div className="border-t pt-2 mt-2 space-y-1.5">
                        <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="text-foreground">{room.type}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Nights</span><span className="text-foreground">{nights}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Rooms</span><span className="text-foreground">{rooms}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="text-foreground">${room.price}/night</span></div>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-display font-bold text-accent">${room.price * nights * parseInt(rooms)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Hotel Results */}
        {showResults && bookingStep === "browse" && (
          <section className="py-8 pb-16">
            <div className="container">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{sortedHotels.length} hotels found</span>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filterRating} onValueChange={setFilterRating}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Rating" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-lg overflow-hidden">
                    <button className={`p-1.5 ${viewMode === "grid" ? "bg-muted" : ""}`} onClick={() => setViewMode("grid")}><Grid className="w-4 h-4 text-muted-foreground" /></button>
                    <button className={`p-1.5 ${viewMode === "list" ? "bg-muted" : ""}`} onClick={() => setViewMode("list")}><List className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>
              </div>

              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {sortedHotels.map((h, i) => (
                  <motion.div key={h.id} {...fadeUp} transition={{ delay: i * 0.05 }} className={`bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all overflow-hidden ${viewMode === "list" ? "flex flex-col sm:flex-row" : ""}`}>
                    {/* Placeholder image area */}
                    <div className={`bg-primary/10 flex items-center justify-center ${viewMode === "list" ? "w-full sm:w-48 h-32 sm:h-auto shrink-0" : "h-40"}`}>
                      <Hotel className="w-10 h-10 text-primary/30" />
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display font-bold text-card-foreground">{h.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{h.location}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex gap-0.5">{Array.from({ length: h.rating }).map((_, s) => <Star key={s} className="w-3 h-3 text-accent fill-accent" />)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{h.reviews.toLocaleString()} reviews</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {h.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">{a}</span>
                        ))}
                      </div>
                      <div className="flex items-end justify-between mt-auto pt-3 border-t">
                        <div>
                          <span className="text-xs text-muted-foreground line-through">${h.originalPrice}</span>
                          <span className="text-2xl font-display font-bold text-accent ml-2">${h.price}</span>
                          <span className="text-xs text-muted-foreground">/night</span>
                        </div>
                        <Button variant="accent" size="sm" onClick={() => { setSelectedHotel(h.id); setSelectedRoom(null); setBookingStep("rooms"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                          View Rooms <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Hotels (before search) */}
        {!showResults && (
          <section className="py-16 bg-muted">
            <div className="container">
              <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
                Featured <span className="text-gradient-accent">Hotels</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_HOTELS.slice(0, 6).map((h, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display font-bold text-card-foreground">{h.name}</h3>
                      <span className="text-accent font-bold text-sm">${h.price}/night</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{h.location}</span>
                    </div>
                    <div className="flex gap-0.5 mb-3">{Array.from({ length: h.rating }).map((_, s) => <Star key={s} className="w-3 h-3 text-accent fill-accent" />)}</div>
                    <div className="flex gap-2">{h.amenities.slice(0, 3).map((a) => <span key={a} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{a}</span>)}</div>
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

export default HotelAccommodation;
