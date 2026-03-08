import { motion } from "framer-motion";

const partners = [
  { name: "Emirates Airlines", abbr: "EA" },
  { name: "Turkish Airlines", abbr: "TK" },
  { name: "Qatar Airways", abbr: "QR" },
  { name: "Lufthansa", abbr: "LH" },
  { name: "DHL Logistics", abbr: "DHL" },
  { name: "Maersk Shipping", abbr: "MSK" },
  { name: "IOM Migration", abbr: "IOM" },
  { name: "IATA Certified", abbr: "IATA" },
  { name: "Booking.com", abbr: "B.C" },
  { name: "Marriott Hotels", abbr: "MH" },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">Trusted By</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold mt-2 text-foreground">
            Our Partners & Affiliates
          </h2>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-12 w-max">
            {[...partners, ...partners].map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex-shrink-0 flex items-center justify-center w-40 h-20 rounded-lg border border-border bg-card hover:shadow-card transition-shadow duration-300 group"
              >
                <div className="text-center">
                  <span className="text-xl font-display font-bold text-muted-foreground group-hover:text-accent transition-colors">
                    {p.abbr}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">{p.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
