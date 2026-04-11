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
    <section className="bg-background py-20 lg:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl sm:mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-accent/80">
            Our Services
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Everything you need for your journey
          </h2>
          <p className="mt-5 text-base text-muted-foreground/90 sm:text-lg">
            Travel, immigration, logistics, and more. We're here to make your life easier.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {services.map((service: ServiceContent, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap] || FileText;
            const link = service.link || "/consultation";
            const category = /logistics|shipment|cargo|freight|transport/i.test(
              `${service.title} ${service.description}`,
            )
              ? "Logistics"
              : "Travel & Immigration";

            // Create visual variety
            const isHighlighted = index === 2 || index === 5;
            const isLarge = index % 3 === 0 && index > 0;

            return (
              <motion.div
                key={`${service.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={isLarge ? "lg:col-span-2" : ""}
              >
                <Link
                  to={link}
                  className={`group block h-full rounded-2xl border transition-all duration-300 ${
                    isHighlighted
                      ? "border-accent/40 bg-accent/8 p-7 shadow-lg hover:shadow-accent/20 hover:border-accent/60 sm:p-8"
                      : "border-card/60 bg-card/40 p-6 shadow-sm hover:shadow-md hover:border-accent/30 sm:p-7"
                  }`}
                >
                  <div
                    className={`${
                      isHighlighted ? "mb-5" : "mb-4"
                    } flex h-14 w-14 items-center justify-center rounded-xl transition-all ${
                      isHighlighted
                        ? "bg-accent/20 text-accent"
                        : "bg-accent/10 text-accent/70 group-hover:bg-accent/15 group-hover:text-accent"
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3
                    className={`${
                      isHighlighted ? "text-lg" : "text-base"
                    } font-display font-semibold text-card-foreground transition-colors group-hover:text-accent`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`${isHighlighted ? "mt-3" : "mt-2"} text-sm leading-relaxed text-muted-foreground/90`}
                  >
                    {service.description}
                  </p>
                  {!isHighlighted && (
                    <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-accent/70 group-hover:text-accent transition-colors">
                      {category}
                    </span>
                  )}
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
