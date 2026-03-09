import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const defaultTestimonials = [
  {
    name: "Adaeze Okafor",
    role: "Nurse, Germany",
    text: "AtlasWave handled my entire Germany work permit process. From credential evaluation to visa approval, everything was seamless.",
    rating: "5",
  },
  {
    name: "Kwame Mensah",
    role: "Business Owner, Accra",
    text: "Their logistics team shipped 3 containers of goods from China to Ghana without a single issue. Real-time tracking and customs clearance were top-notch.",
    rating: "5",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Tourist, Dubai",
    text: "Booked a family vacation through AtlasWave with flights, hotels, and tours all arranged perfectly.",
    rating: "5",
  },
  {
    name: "Daniel Eze",
    role: "Engineer, Canada",
    text: "I got my Canada LMIA work permit approved in record time. The team kept me updated at every step.",
    rating: "4",
  },
];

const TestimonialsSection = () => {
  const { testimonials: cmsTestimonials } = useSiteContent();
  const testimonials = cmsTestimonials.length > 0 ? cmsTestimonials : defaultTestimonials;

  return (
    <section className="bg-muted py-20 sm:py-24">
      <div className="container">
        <div className="mb-12 text-center sm:mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">Testimonials</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            What Our <span className="text-gradient-accent">Clients</span> Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Thousands of satisfied clients across travel, immigration, and logistics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {testimonials.map((testimonial, index) => {
            const rating = parseInt(testimonial.rating || "5", 10);
            const initials = testimonial.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={`${testimonial.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-6"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-4 w-4 ${starIndex < rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{testimonial.name}</p>
                    {testimonial.role && <p className="text-xs text-muted-foreground">{testimonial.role}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
