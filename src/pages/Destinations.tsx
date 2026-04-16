import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("destinations")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setDestinations((data as any) || []);
        setLoading(false);
      });
  }, []);

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative bg-primary pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="container relative z-10 text-center">
            <motion.h1 {...fadeUp} className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
              Travel <span className="text-accent">Destinations</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="mt-4 text-primary-foreground/70 max-w-xl mx-auto">
              Explore our curated collection of destinations with tailored travel packages.
            </motion.p>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-8 max-w-md mx-auto">
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-primary-foreground/50" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search destinations..."
                  className="bg-transparent border-none outline-none text-primary-foreground placeholder:text-primary-foreground/40 w-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading destinations...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No destinations found.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((d, i) => (
                  <motion.div key={d.id} {...fadeUp} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={`/destinations/${d.id}`}
                      className="group block h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="relative h-52 overflow-hidden bg-muted">
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
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-accent transition-colors">{d.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {d.country}
                        </p>
                        {d.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{d.description}</p>}
                        {d.price_from && (
                          <p className="mt-3 font-display font-bold text-accent">
                            From ${d.price_from.toLocaleString()}
                          </p>
                        )}
                        {d.highlights.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {d.highlights.slice(0, 3).map(h => (
                              <span key={h} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{h}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                          Explore <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
