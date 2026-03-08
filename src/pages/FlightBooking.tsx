import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, MapPin, Calendar, Users, CheckCircle2, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const popularRoutes = [
  { from: "Lagos", to: "London", price: "$450", airline: "Turkish Airlines" },
  { from: "Accra", to: "New York", price: "$680", airline: "Emirates" },
  { from: "Nairobi", to: "Dubai", price: "$380", airline: "Qatar Airways" },
  { from: "Lagos", to: "Johannesburg", price: "$320", airline: "Ethiopian Airlines" },
  { from: "Accra", to: "Toronto", price: "$720", airline: "KLM" },
  { from: "Lagos", to: "Frankfurt", price: "$520", airline: "Lufthansa" },
];

const FlightBooking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
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

        {/* Search */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <motion.div {...fadeUp} className="bg-card rounded-2xl p-8 border shadow-card -mt-20 relative z-20">
              <h2 className="text-xl font-display font-bold text-card-foreground mb-6">Search Flights</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Departure city" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Destination city" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Passengers</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} Passenger{n > 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="accent" className="w-full">Search Flights</Button>
            </motion.div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className="py-16 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Popular <span className="text-gradient-accent">Routes</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoutes.map((r, i) => (
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

        {/* Why Book With Us */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-10">Why Book With Us</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              {["Competitive fares from 500+ airlines", "24/7 booking support", "Free rebooking on select tickets", "Group & corporate travel discounts"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FlightBooking;
