import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const FindUsSection = () => {
  const { contact } = useSiteContent();
  const address = contact?.address || "Kasoa New Market, Ghana";
  const mapQuery = encodeURIComponent(address);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            Find Us
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Visit Our Office
          </h2>
          <p className="text-muted-foreground">
            Stop by for in-person consultations on visas, travel bookings, work permits, and logistics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-2xl overflow-hidden border bg-card shadow-card min-h-[360px]"
          >
            <iframe
              title="AtlasWave office location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="100%"
              className="min-h-[360px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">{address}</p>
            </div>
            {contact?.phone && (
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Call Us</h3>
                <a href={`tel:${contact.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact?.hours && (
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Hours</h3>
                <p className="text-sm text-muted-foreground">{contact.hours.split("|")[0]?.trim()}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FindUsSection;
