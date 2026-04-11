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
        <motion.div {...fadeUp} className="mb-14 max-w-2xl sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent/70">Hot Offers</span>
          <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
            Don't miss these <span className="text-accent">exclusive deals</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground/90 sm:text-lg">
            Limited slots available. Book now to secure your spot at unbeatable prices.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-2 sm:mb-12">
          {["All", "Flight", "Hotel", "Package"].map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "ghost"}
              size="sm"
              className="rounded-full text-xs font-medium"
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-card bg-card/30 p-12 text-center">
            <p className="text-muted-foreground">No deals available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {filtered.map((deal, index) => {
              const timeLeft = calcTime(deal.deadline);
              const isFeatured = index === 0;

              return (
                <motion.div
                  key={deal.id || `${deal.title}-${index}`}
                  {...fadeUp}
                  transition={{ delay: index * 0.06 }}
                  className={isFeatured ? "lg:col-span-2 lg:row-span-1" : ""}
                >
                  <div
                    className={`group h-full overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isFeatured
                        ? "border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg hover:shadow-accent/30 hover:border-accent/60"
                        : "border-card/60 bg-card/50 shadow-sm hover:shadow-md hover:border-accent/30"
                    }`}
                  >
                    <div className={`p-${isFeatured ? 6 : 5}`}>
                      <div className={`relative rounded-xl bg-primary/5 p-${isFeatured ? 5 : 4}`}>
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className={`flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ${
                            isFeatured ? "text-sm" : ""
                          }`}>
                            <Flame className={isFeatured ? "h-4 w-4" : "h-3 w-3"} /> {deal.tag}
                          </span>
                          <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">
                            {deal.discount}
                          </span>
                        </div>
                        <h3 className={`font-bold text-card-foreground ${isFeatured ? "text-lg" : "text-sm"}`}>
                          {deal.title}
                        </h3>
                        <div className={`mt-${isFeatured ? 4 : 2} flex flex-wrap items-baseline gap-2`}>
                          <span className={`font-display font-bold text-accent ${isFeatured ? "text-3xl" : "text-2xl"}`}>
                            {deal.price}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {deal.originalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-${isFeatured ? 6 : 5} pb-${isFeatured ? 6 : 5}`}>
                      <div className="mb-4 mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span className={isFeatured ? "text-sm" : ""}>
                          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                        </span>
                      </div>
                      <Button variant="accent" size={isFeatured ? "lg" : "sm"} className="w-full" asChild>
                        <Link to="/consultation">
                          Book Now <ArrowRight className={isFeatured ? "ml-2 h-4 w-4" : "ml-1 h-3 w-3"} />
                        </Link>
                      </Button>
                    </div>
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
