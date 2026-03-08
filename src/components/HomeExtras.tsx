import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag, Flame } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const deals = [
  { type: "Flight", title: "Accra → London Return", originalPrice: "$890", price: "$649", discount: "27% OFF", deadline: "2024-04-15T00:00:00", tag: "Hot Deal" },
  { type: "Hotel", title: "5★ Dubai Marina — 3 Nights", originalPrice: "$720", price: "$499", discount: "31% OFF", deadline: "2024-04-10T00:00:00", tag: "Limited" },
  { type: "Package", title: "Istanbul + Cappadocia — 7 Days", originalPrice: "$1,400", price: "$1,050", discount: "25% OFF", deadline: "2024-04-20T00:00:00", tag: "Popular" },
  { type: "Flight", title: "Lagos → Toronto One-Way", originalPrice: "$850", price: "$620", discount: "27% OFF", deadline: "2024-04-12T00:00:00", tag: "Flash Sale" },
];

function useCountdown(deadline: string) {
  const [time, setTime] = useState(() => calcTime(deadline));
  useState(() => {
    const id = setInterval(() => setTime(calcTime(deadline)), 1000);
    return () => clearInterval(id);
  });
  return time;
}

function calcTime(deadline: string) {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { days: d, hours: h, minutes: m };
}

const DealsSection = () => {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? deals : deals.filter((d) => d.type === filter);

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">Limited Time Offers</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Featured <span className="text-gradient-accent">Deals</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Grab exclusive discounts on flights, hotels, and travel packages before they expire.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10">
          {["All", "Flight", "Hotel", "Package"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="text-xs">
              {f}s
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((deal, i) => {
            const t = calcTime(deal.deadline);
            return (
              <motion.div key={deal.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all overflow-hidden group">
                <div className="p-1.5">
                  <div className="bg-primary/5 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-accent/10 text-accent rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {deal.tag}
                      </span>
                      <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">{deal.discount}</span>
                    </div>
                    <h3 className="font-display font-bold text-card-foreground text-sm">{deal.title}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-display font-bold text-accent">{deal.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  {/* Countdown */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{t.days}d {t.hours}h {t.minutes}m left</span>
                  </div>
                  <Button variant="accent" size="sm" className="w-full" asChild>
                    <Link to="/consultation">Book Now <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-accent rounded-full blur-[150px]" />
      </div>
      <div className="container relative z-10">
        <motion.div {...fadeUp} className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
            Stay in the Loop
          </h2>
          <p className="text-primary-foreground/70 mt-4 text-lg">
            Get exclusive travel deals, immigration updates, and logistics news delivered to your inbox.
          </p>
          {subscribed ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 bg-secondary/20 rounded-xl p-6 border border-secondary/30">
              <p className="text-primary-foreground font-semibold">🎉 You're subscribed!</p>
              <p className="text-primary-foreground/60 text-sm mt-1">Watch your inbox for exclusive deals.</p>
            </motion.div>
          ) : (
            <div className="flex gap-3 mt-8 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              />
              <Button variant="accent" className="h-12 px-6 shrink-0" onClick={handleSubscribe}>
                Subscribe
              </Button>
            </div>
          )}
          <p className="text-primary-foreground/40 text-xs mt-4">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export { DealsSection, NewsletterSection };
