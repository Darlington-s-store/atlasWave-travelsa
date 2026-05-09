import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
  price_from: number | null;
  currency: string;
  featured: boolean;
  highlights: string[];
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const DestinationsSection = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    supabase
      .from("destinations")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => setDestinations((data as any) || []));
  }, []);

  if (destinations.length === 0) return null;

  const featured = destinations.filter(d => d.featured).slice(0, 4);
  const others = destinations.filter(d => !d.featured).slice(0, 4);
  const display = [...featured, ...others].slice(0, 8);

  return (
    <section className="bg-muted/30 py-20 sm:py-24">
      <div className="container">
        <motion.div {...fadeUp} className="mb-14 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent/70">Popular Destinations</span>
          <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
            Explore the <span className="text-accent">world</span> with us
          </h2>
          <p className="mt-5 text-base text-muted-foreground/90 sm:text-lg">
            Curated destinations with the best flights, hotels, and experiences for every traveler.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {display.map((d, i) => (
            <motion.div key={d.id} {...fadeUp} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/destinations/${d.id}`}
                className="group block h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-accent/30"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {d.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
                      <Star className="h-3 w-3" /> Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">{d.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {d.country}
                      </p>
                    </div>
                    {d.price_from && (
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">From</p>
                        <p className="font-display font-bold text-accent">${d.price_from.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {d.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {d.highlights.slice(0, 3).map(h => (
                        <span key={h} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} className="mt-10 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/destinations">
              View All Destinations <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsSection;
