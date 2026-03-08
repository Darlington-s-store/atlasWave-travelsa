import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hotel, MapPin, Star, CheckCircle2, Wifi, Car, Coffee } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const featuredHotels = [
  { name: "Grand Marriott Istanbul", location: "Istanbul, Turkey", rating: 5, price: "$120/night", amenities: ["WiFi", "Pool", "Spa"] },
  { name: "Hilton Dubai Creek", location: "Dubai, UAE", rating: 5, price: "$180/night", amenities: ["WiFi", "Beach", "Gym"] },
  { name: "Kempinski Accra", location: "Accra, Ghana", rating: 5, price: "$150/night", amenities: ["WiFi", "Pool", "Restaurant"] },
  { name: "Radisson Blu Lagos", location: "Lagos, Nigeria", rating: 4, price: "$95/night", amenities: ["WiFi", "Bar", "Parking"] },
  { name: "InterContinental Nairobi", location: "Nairobi, Kenya", rating: 4, price: "$110/night", amenities: ["WiFi", "Spa", "Lounge"] },
  { name: "Movenpick Johannesburg", location: "Johannesburg, SA", rating: 4, price: "$85/night", amenities: ["WiFi", "Pool", "Gym"] },
];

const HotelAccommodation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <Hotel className="w-4 h-4 inline mr-2" />Hotel & Accommodation
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
        <section className="py-16">
          <div className="container max-w-4xl">
            <motion.div {...fadeUp} className="bg-card rounded-2xl p-8 border shadow-card -mt-20 relative z-20">
              <h2 className="text-xl font-display font-bold text-card-foreground mb-6">Find Your Stay</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Destination</label>
                  <Input placeholder="City or hotel name" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Check-in</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Check-out</label>
                  <Input type="date" />
                </div>
              </div>
              <Button variant="accent" className="w-full">Search Hotels</Button>
            </motion.div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="py-16 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Featured <span className="text-gradient-accent">Hotels</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHotels.map((h, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-card-foreground">{h.name}</h3>
                    <span className="text-accent font-bold text-sm">{h.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{h.location}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: h.rating }).map((_, s) => (
                      <Star key={s} className="w-3 h-3 text-accent fill-accent" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {h.amenities.map(a => (
                      <span key={a} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{a}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HotelAccommodation;
