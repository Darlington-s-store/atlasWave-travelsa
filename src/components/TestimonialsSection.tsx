import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const defaultTestimonials = [
  {
    name: "Adaeze Okafor",
    role: "Nurse, Germany",
    text: "AtlasWave handled my entire Germany work permit process. From credential evaluation to visa approval — everything was seamless. I'm now working in Berlin!",
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
    text: "Booked a family vacation through AtlasWave — flights, hotels, and tours all arranged perfectly. The best travel experience we've ever had.",
    rating: "5",
  },
  {
    name: "Daniel Eze",
    role: "Engineer, Canada",
    text: "I got my Canada LMIA work permit approved in record time. The consultation was thorough and the team kept me updated at every step.",
    rating: "4",
  },
];

const TestimonialsSection = () => {
  const { testimonials: cmsTestimonials, loading } = useSiteContent();

  // Use CMS testimonials if available, otherwise fall back to defaults
  const testimonials = cmsTestimonials.length > 0 ? cmsTestimonials : defaultTestimonials;

  return (
    <section className="py-24 bg-muted">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
            What Our <span className="text-gradient-accent">Clients</span> Say
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Thousands of satisfied clients across travel, immigration, and logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => {
            const rating = parseInt(t.rating || "5");
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={t.name + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s < rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
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
