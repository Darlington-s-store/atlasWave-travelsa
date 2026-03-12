import { motion } from "framer-motion";
import {
  Briefcase,
  CreditCard,
  FileCheck,
  FileText,
  Globe,
  Hotel,
  Package,
  Plane,
  Ship,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useSiteContent, type ServiceContent } from "@/hooks/useSiteContent";

const iconMap = {
  Plane,
  Hotel,
  FileCheck,
  Briefcase,
  Globe,
  Ship,
  Truck,
  CreditCard,
  Package,
  FileText,
} as const;

const ServicesSection = () => {
  const { services } = useSiteContent();

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-20 lg:pt-36">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            What We Offer
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Comprehensive Travel & Logistics Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From booking your next trip to securing work permits and shipping cargo, we have you
            covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {services.map((service: ServiceContent, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap] || FileText;
            const link = service.link || "/consultation";
            const category = /logistics|shipment|cargo|freight|transport/i.test(
              `${service.title} ${service.description}`,
            )
              ? "Logistics"
              : "Travel & Immigration";

            return (
              <motion.div
                key={`${service.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={link}
                  className="group block h-full rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-accent">
                    {category}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
