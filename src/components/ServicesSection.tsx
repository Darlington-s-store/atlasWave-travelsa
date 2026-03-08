import { motion } from "framer-motion";
import { Plane, Hotel, FileCheck, Briefcase, Ship, Truck, Globe, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Plane, title: "Flight Booking", desc: "International & local flights with competitive pricing and custom travel packages.", link: "/travel/flights", category: "travel" },
  { icon: Hotel, title: "Hotel & Accommodation", desc: "Premium hotel search, booking, and reservation system worldwide.", link: "/travel/hotels", category: "travel" },
  { icon: FileCheck, title: "Visa Assistance", desc: "Tourist, student, and work visa processing with expert guidance.", link: "/travel/visa", category: "travel" },
  { icon: Briefcase, title: "Work Permits", desc: "Schengen, Canada LMIA, Germany Chancenkarte, and USA NCLEX pathways.", link: "/work-permits", category: "travel" },
  { icon: Globe, title: "Credential Evaluation", desc: "ECA, nursing credential verification, and qualification reviews.", link: "/work-permits/credential-evaluation", category: "travel" },
  { icon: Ship, title: "Sea & Air Freight", desc: "Reliable cargo shipping by sea and air to destinations worldwide.", link: "/logistics", category: "logistics" },
  { icon: Truck, title: "Road Transport", desc: "Efficient ground transportation and customs clearance services.", link: "/logistics", category: "logistics" },
  { icon: CreditCard, title: "Online Payments", desc: "Secure payments via Mastercard and Mobile Money for all services.", link: "/payments", category: "logistics" },
];

const ServicesSection = () => {
  return (
    <section className="py-24 lg:pt-36 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">What We Offer</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Comprehensive Global Services
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            From booking your next trip to securing work permits and shipping cargo — we've got you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={service.link}
                className="group block bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider text-accent">
                  {service.category === "travel" ? "Travel & Immigration" : "Logistics"}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
