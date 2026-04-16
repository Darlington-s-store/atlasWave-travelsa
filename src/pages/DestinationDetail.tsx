import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowLeft, Plane, Hotel, Globe } from "lucide-react";
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

// Country to coordinates mapping for the map embed
const countryCoords: Record<string, string> = {
  "United Arab Emirates": "25.2048,55.2708",
  "United Kingdom": "51.5074,-0.1278",
  "France": "48.8566,2.3522",
  "Canada": "43.6532,-79.3832",
  "Kenya": "-1.2921,36.8219",
  "Turkey": "41.0082,28.9784",
  "United States": "40.7128,-74.0060",
  "South Africa": "-26.2041,28.0473",
  "Ghana": "5.6037,-0.1870",
  "Germany": "52.5200,13.4050",
  "Netherlands": "52.3676,4.9041",
  "Italy": "41.9028,12.4964",
  "Spain": "40.4168,-3.7038",
  "Japan": "35.6762,139.6503",
  "Australia": "-33.8688,151.2093",
  "Brazil": "-23.5505,-46.6333",
  "Egypt": "30.0444,31.2357",
  "Thailand": "13.7563,100.5018",
  "Singapore": "1.3521,103.8198",
  "India": "28.6139,77.2090",
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setDestination(data as any);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <MapPin className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg">Destination not found</p>
          <Button asChild><Link to="/destinations">Back to Destinations</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const coords = countryCoords[destination.country] || "0,0";
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(() => {
    const [lat, lng] = coords.split(",").map(Number);
    return `${lng - 0.15},${lat - 0.1},${lng + 0.15},${lat + 0.1}`;
  })()}&layer=mapnik&marker=${coords}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero image */}
        <div className="relative h-[50vh] min-h-[350px] bg-primary">
          {destination.image_url && (
            <img src={destination.image_url} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 container">
            <Link to="/destinations" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Destinations
            </Link>
            <motion.h1 {...fadeUp} className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {destination.name}
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-white/80 text-lg flex items-center gap-2 mt-2">
              <MapPin className="w-5 h-5" /> {destination.country}
            </motion.p>
            {destination.featured && (
              <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-xs font-bold text-accent-foreground">
                <Star className="h-3 w-3" /> Featured Destination
              </motion.div>
            )}
          </div>
        </div>

        <section className="py-12 sm:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                {destination.description && (
                  <motion.div {...fadeUp}>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">About {destination.name}</h2>
                    <p className="text-muted-foreground leading-relaxed">{destination.description}</p>
                  </motion.div>
                )}

                {destination.highlights.length > 0 && (
                  <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">Highlights</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {destination.highlights.map(h => (
                        <div key={h} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5 text-accent" />
                          </div>
                          <span className="font-medium text-foreground text-sm">{h}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Map */}
                <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">Location</h2>
                  <div className="rounded-2xl overflow-hidden border aspect-video">
                    <iframe
                      src={mapUrl}
                      className="w-full h-full border-0"
                      title={`Map of ${destination.name}`}
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-2xl border bg-card p-6 sticky top-24">
                  {destination.price_from && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="font-display text-3xl font-bold text-accent">${destination.price_from.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" asChild>
                      <Link to="/travel/flights">
                        <Plane className="w-4 h-4 mr-2" /> Find Flights
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link to="/travel/hotels">
                        <Hotel className="w-4 h-4 mr-2" /> Find Hotels
                      </Link>
                    </Button>
                    <Button variant="accent" className="w-full" size="lg" asChild>
                      <Link to="/consultation">
                        Book Consultation
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationDetail;
