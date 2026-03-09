import { motion } from "framer-motion";
import { Briefcase, CreditCard, FileCheck, Globe, Hotel, Plane, Ship, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Plane,
    title: "Flight Booking",
    desc: "International and local flights with competitive pricing and custom travel packages.",
    link: "/travel/flights",
    category: "travel",
  },
  {
    icon: Hotel,
    title: "Hotel & Accommodation",
    desc: "Premium hotel search, booking, and reservation support worldwide.",
    link: "/travel/hotels",
    category: "travel",
  },
  {
    icon: FileCheck,
    title: "Visa Assistance",
    desc: "Tourist, student, and work visa processing with expert guidance.",
    link: "/travel/visa",
    category: "travel",
  },
  {
    icon: Briefcase,
    title: "Work Permits",
    desc: "Schengen, Canada LMIA, Germany Opportunity Card, and USA NCLEX pathways.",
    link: "/work-permits",
    category: "travel",
  },
  {
    icon: Globe,
    title: "Credential Evaluation",
    desc: "ECA, nursing credential verification, and qualification reviews.",
    link: "/work-permits/credential-evaluation",
    category: "travel",
  },
  {
    icon: Ship,
    title: "Sea & Air Freight",
    desc: "Reliable cargo shipping by sea and air to destinations worldwide.",
    link: "/logistics",
    category: "logistics",
  },
  {
    icon: Truck,
    title: "Road Transport",
    desc: "Efficient ground transportation and customs clearance services.",
    link: "/logistics",
    category: "logistics",
  },
  {
    icon: CreditCard,
    title: "Online Payments",
    desc: "Secure payments via Mastercard and Mobile Money for all services.",
    link: "/payments",
    category: "logistics",
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-background py-20 lg:pt-36">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">What We Offer</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Comprehensive Travel & Logistics Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From booking your next trip to securing work permits and shipping cargo, we have you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={service.link}
                className="group block h-full rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <service.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground">{service.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-accent">
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
