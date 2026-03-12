import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteContent, type DealContent } from "@/hooks/useSiteContent";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

interface DealItem {
  id?: string;
  type: string;
  title: string;
  originalPrice: string;
  price: string;
  discount: string;
  deadline: string;
  tag: string;
}

function calcTime(deadline: string) {
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

const DealsSection = () => {
  const [filter, setFilter] = useState("All");
  const { deals: cmsDeals } = useSiteContent();

  const deals: DealItem[] = cmsDeals.map((deal: DealContent) => ({
    id: deal.id,
    type: deal.type,
    title: deal.title,
    originalPrice: deal.original_price,
    price: deal.price,
    discount: deal.discount,
    deadline: deal.deadline,
    tag: deal.tag,
  }));

  const filtered = filter === "All" ? deals : deals.filter((deal) => deal.type === filter);

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="container">
        <motion.div {...fadeUp} className="mb-10 text-center sm:mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">Limited Time Offers</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Featured <span className="text-gradient-accent">Deals</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Grab exclusive discounts on flights, hotels, and travel packages before they expire.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10">
          {["All", "Flight", "Hotel", "Package"].map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              size="sm"
              className="min-w-[82px] text-xs"
              onClick={() => setFilter(item)}
            >
              {item}s
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No featured deals have been published yet.
          </div>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {filtered.map((deal, index) => {
            const timeLeft = calcTime(deal.deadline);

            return (
              <motion.div
                key={deal.id || `${deal.title}-${index}`}
                {...fadeUp}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="p-1.5">
                  <div className="relative rounded-lg bg-primary/5 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                        <Flame className="h-3 w-3" /> {deal.tag}
                      </span>
                      <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">
                        {deal.discount}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">{deal.title}</h3>
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-accent">{deal.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="mb-4 mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                    </span>
                  </div>
                  <Button variant="accent" size="sm" className="w-full" asChild>
                    <Link to="/consultation">
                      Book Now <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
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
    <section className="relative overflow-hidden bg-primary py-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-accent blur-[150px]" />
      </div>
      <div className="container relative z-10">
        <motion.div {...fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Stay in the Loop</h2>
          <p className="mt-4 text-base text-primary-foreground/70 sm:text-lg">
            Get exclusive travel deals, immigration updates, and logistics news delivered to your inbox.
          </p>
          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 rounded-xl border border-secondary/30 bg-secondary/20 p-6"
            >
              <p className="font-semibold text-primary-foreground">You are subscribed.</p>
              <p className="mt-1 text-sm text-primary-foreground/60">Watch your inbox for exclusive deals.</p>
            </motion.div>
          ) : (
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSubscribe()}
                className="h-12 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
              />
              <Button variant="accent" className="h-12 shrink-0 px-6 sm:w-auto" onClick={handleSubscribe}>
                Subscribe
              </Button>
            </div>
          )}
          <p className="mt-4 text-xs text-primary-foreground/40">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export { DealsSection, NewsletterSection };
