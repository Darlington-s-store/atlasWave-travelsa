import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hotel,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
  Phone,
  Grid,
  List,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { toast } from "@/hooks/use-toast";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const amenityIcons: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  Pool: Waves,
  Spa: Coffee,
  Gym: Dumbbell,
  Parking: Car,
  Restaurant: UtensilsCrossed,
  Bar: Coffee,
  Beach: Waves,
  Lounge: Coffee,
};

const MOCK_HOTELS = [
  {
    id: 1,
    name: "Grand Marriott Istanbul",
    location: "Istanbul, Turkey",
    rating: 5,
    reviews: 1284,
    price: 120,
    originalPrice: 160,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
    roomTypes: [
      { type: "Deluxe Room", beds: "1 King", size: "35 sqm", price: 120 },
      { type: "Executive Suite", beds: "1 King + Sofa", size: "55 sqm", price: 220 },
      { type: "Family Room", beds: "2 Queens", size: "45 sqm", price: 180 },
    ],
  },
  {
    id: 2,
    name: "Hilton Dubai Creek",
    location: "Dubai, UAE",
    rating: 5,
    reviews: 2150,
    price: 180,
    originalPrice: 240,
    amenities: ["WiFi", "Beach", "Gym", "Pool", "Restaurant"],
    roomTypes: [
      { type: "Standard Room", beds: "1 Queen", size: "30 sqm", price: 180 },
      { type: "Creek View Suite", beds: "1 King", size: "60 sqm", price: 350 },
    ],
  },
  {
    id: 3,
    name: "Kempinski Accra",
    location: "Accra, Ghana",
    rating: 5,
    reviews: 890,
    price: 150,
    originalPrice: 190,
    amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Bar"],
    roomTypes: [
      { type: "Superior Room", beds: "1 King", size: "38 sqm", price: 150 },
      { type: "Presidential Suite", beds: "1 King + Living", size: "90 sqm", price: 450 },
    ],
  },
  {
    id: 4,
    name: "Radisson Blu Lagos",
    location: "Lagos, Nigeria",
    rating: 4,
    reviews: 654,
    price: 95,
    originalPrice: 120,
    amenities: ["WiFi", "Bar", "Parking", "Gym"],
    roomTypes: [
      { type: "Standard Room", beds: "1 Queen", size: "28 sqm", price: 95 },
      { type: "Business Room", beds: "1 King", size: "35 sqm", price: 140 },
    ],
  },
  {
    id: 5,
    name: "InterContinental Nairobi",
    location: "Nairobi, Kenya",
    rating: 4,
    reviews: 1102,
    price: 110,
    originalPrice: 145,
    amenities: ["WiFi", "Spa", "Lounge", "Restaurant"],
    roomTypes: [
      { type: "Classic Room", beds: "1 King", size: "32 sqm", price: 110 },
      { type: "Club Suite", beds: "1 King", size: "50 sqm", price: 230 },
    ],
  },
  {
    id: 6,
    name: "Movenpick Johannesburg",
    location: "Johannesburg, SA",
    rating: 4,
    reviews: 780,
    price: 85,
    originalPrice: 110,
    amenities: ["WiFi", "Pool", "Gym", "Parking"],
    roomTypes: [
      { type: "Superior Room", beds: "1 Queen", size: "30 sqm", price: 85 },
      { type: "Junior Suite", beds: "1 King", size: "42 sqm", price: 160 },
    ],
  },
];

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

    if (filterRating !== "all") {
      hotels = hotels.filter((entry) => entry.rating >= parseInt(filterRating, 10));
    }

    hotels.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

    return hotels;
  }, [filterRating, sortBy]);

  const hotel = MOCK_HOTELS.find((entry) => entry.id === selectedHotel);
  const room = hotel?.roomTypes.find((entry) => entry.type === selectedRoom);
  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
        )
      : 3;

  const handleSearch = () => {
    setShowResults(true);
    setBookingStep("browse");
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative bg-primary pb-20 pt-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-20 h-80 w-80 rounded-full bg-secondary blur-[140px]" />
          </div>

          <div className="container relative z-10 text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <span className="mb-6 inline-block rounded-full border border-accent/30 bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
                <Hotel className="mr-2 inline h-4 w-4" />
                Hotels & Accommodation
              </span>
              <h1 className="text-4xl font-display font-bold leading-tight text-primary-foreground md:text-6xl">
                Premium <span className="text-gradient-accent">Stays</span> Worldwide
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70">
                Curated hotels and accommodations across 100+ destinations at the best rates.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-8">
          <div className="container max-w-5xl">
            <motion.div
              {...fadeUp}
              className="relative z-20 -mt-12 rounded-2xl border bg-card p-4 shadow-card sm:-mt-16 sm:p-6 md:p-8"
            >
              <h2 className="mb-5 text-xl font-display font-bold text-card-foreground sm:mb-6">
                Find Your Perfect Stay
              </h2>
              <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="sm:col-span-2 xl:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City or hotel name"
                      className="h-12 pl-10"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Check-in
                  </label>
                  <Input
                    type="date"
                    className="h-12"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Check-out
                  </label>
                  <Input
                    type="date"
                    className="h-12"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Guests
                    </label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Rooms
                    </label>
                    <Select value={rooms} onValueChange={setRooms}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3].map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button variant="accent" className="h-12 w-full" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search Hotels
              </Button>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {bookingStep === "rooms" && hotel && (
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
                  onClick={() => setBookingStep("browse")}
                  className="mb-4"
                >
                  <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
                  Back to results
                </Button>
                <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card sm:p-6">
                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">
                        {hotel.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{hotel.location}</span>
                        <div className="ml-0 flex gap-0.5 sm:ml-2">
                          {Array.from({ length: hotel.rating }).map((_, index) => (
                            <Star
                              key={index}
                              className="h-3 w-3 fill-accent text-accent"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {hotel.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity] || Wifi;

                        return (
                          <div
                            key={amenity}
                            title={amenity}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h3 className="mb-4 mt-6 font-display font-semibold text-foreground">
                    Select Room Type
                  </h3>
                  <div className="space-y-3">
                    {hotel.roomTypes.map((roomType) => (
                      <div
                        key={roomType.type}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          selectedRoom === roomType.type
                            ? "bg-accent/5 ring-2 ring-accent"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedRoom(roomType.type)}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{roomType.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {`${roomType.beds} | ${roomType.size}`}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xl font-display font-bold text-accent">
                              {formatCurrency(roomType.price, DEFAULT_CURRENCY)}
                            </p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRoom && room && (
                    <Button
                      variant="accent"
                      className="mt-6 h-12 w-full"
                      onClick={() => setBookingStep("guest")}
                    >
                      Continue -{" "}
                      {formatCurrency(room.price * nights * parseInt(rooms, 10), DEFAULT_CURRENCY)}{" "}
                      for {nights} nights
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {bookingStep === "guest" && hotel && room && (
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
                  onClick={() => setBookingStep("rooms")}
                  className="mb-4"
                >
                  <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
                  Back to rooms
                </Button>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="order-2 rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:order-1 lg:col-span-2">
                    <h3 className="mb-6 text-xl font-display font-bold text-card-foreground">
                      Guest Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Full Name</Label>
                          <Input placeholder="John Doe" className="h-10" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Email</Label>
                          <Input type="email" placeholder="john@example.com" className="h-10" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Phone</Label>
                          <Input placeholder="+233 XX XXX XXXX" className="h-10" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Special Requests</Label>
                          <Input placeholder="Early check-in, extra pillows..." className="h-10" />
                        </div>
                      </div>
                    </div>

                    <h4 className="mb-3 mt-6 text-sm font-semibold text-foreground">
                      Payment Method
                    </h4>
                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-12 justify-center gap-2 sm:justify-start"
                      >
                        <CreditCard className="h-4 w-4" />
                        Mastercard
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 justify-center gap-2 sm:justify-start"
                      >
                        <Phone className="h-4 w-4" />
                        Mobile Money
                      </Button>
                    </div>
                    <Button
                      variant="accent"
                      className="h-12 w-full"
                      onClick={() => {
                        setBookingStep("confirm");
                        toast({
                          title: "Reservation Confirmed!",
                          description: `Your stay at ${hotel.name} has been booked.`,
                        });
                      }}
                    >
                      Confirm & Pay{" "}
                      {formatCurrency(room.price * nights * parseInt(rooms, 10), DEFAULT_CURRENCY)}
                      <ShieldCheck className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="order-1 h-fit rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:order-2 lg:sticky lg:top-24">
                    <h4 className="mb-4 font-display font-bold text-foreground">
                      Booking Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-foreground">{hotel.name}</p>
                      <p className="text-muted-foreground">{hotel.location}</p>
                      <div className="mt-2 space-y-1.5 border-t pt-2">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Room</span>
                          <span className="text-right text-foreground">{room.type}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Nights</span>
                          <span className="text-foreground">{nights}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Rooms</span>
                          <span className="text-foreground">{rooms}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="text-right text-foreground">
                            {formatCurrency(room.price, DEFAULT_CURRENCY)}/night
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-display font-bold text-accent">
                          {formatCurrency(
                            room.price * nights * parseInt(rooms, 10),
                            DEFAULT_CURRENCY,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {showResults && bookingStep === "browse" && (
          <section className="pb-16 pt-8">
            <div className="container">
              <div className="mb-6 rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-sm text-muted-foreground">
                      {sortedHotels.length} hotels found
                    </span>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={filterRating} onValueChange={setFilterRating}>
                        <SelectTrigger className="h-10 w-full min-w-[140px] text-xs sm:w-36">
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as typeof sortBy)}
                    >
                      <SelectTrigger className="h-10 w-full min-w-[140px] text-xs sm:w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex self-start overflow-hidden rounded-lg border">
                      <button
                        className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {sortedHotels.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    {...fadeUp}
                    transition={{ delay: index * 0.05 }}
                    className={`overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:shadow-card-hover ${
                      viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center bg-primary/10 ${
                        viewMode === "list"
                          ? "h-32 w-full shrink-0 sm:h-auto sm:w-48"
                          : "h-40"
                      }`}
                    >
                      <Hotel className="h-10 w-10 text-primary/30" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-display font-bold text-card-foreground">
                            {entry.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {entry.location}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 sm:text-right">
                          <div className="flex gap-0.5">
                            {Array.from({ length: entry.rating }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className="h-3 w-3 fill-accent text-accent"
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entry.reviews.toLocaleString()} reviews
                          </p>
                        </div>
                      </div>
                      <div className="my-3 flex flex-wrap gap-1.5">
                        {entry.amenities.slice(0, 4).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(entry.originalPrice, DEFAULT_CURRENCY)}
                          </span>
                          <span className="ml-2 text-2xl font-display font-bold text-accent">
                            {formatCurrency(entry.price, DEFAULT_CURRENCY)}
                          </span>
                          <span className="text-xs text-muted-foreground">/night</span>
                        </div>
                        <Button
                          variant="accent"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedHotel(entry.id);
                            setSelectedRoom(null);
                            setBookingStep("rooms");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          View Rooms
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!showResults && (
          <section className="bg-muted py-16">
            <div className="container">
              <h2 className="mb-12 text-center text-3xl font-display font-bold text-foreground">
                Featured <span className="text-gradient-accent">Hotels</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_HOTELS.slice(0, 6).map((entry, index) => (
                  <motion.div
                    key={index}
                    {...fadeUp}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="font-display font-bold text-card-foreground">
                        {entry.name}
                      </h3>
                      <span className="shrink-0 text-sm font-bold text-accent">
                        {formatCurrency(entry.price, DEFAULT_CURRENCY)}/night
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.location}</span>
                    </div>
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: entry.rating }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-3 w-3 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
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
